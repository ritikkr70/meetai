import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import JSONL from "jsonl-parse-stringify";
import { db } from "../../db";
import { agents, meetings, user } from "../../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { createAgent, openai, TextMessage } from "@inngest/agent-kit";
import { streamChat } from "@/lib/stream-chat";
import { generateAvatarUri } from "@/lib/avatar";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const summarizer = createAgent({
  name: "summarizer",
  system: `
    You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

Use the following markdown structure for every output:

### Overview
Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

### Notes
Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

Example:
#### Section Name
- Main point or demo shown here
- Another key insight or interaction
- Follow-up tool or explanation provided

#### Next Section
- Feature X automatically does Y
- Mention of integration with Z
  `.trim(),
  model: openai({ model: "gpt-4o-mini", apiKey: process.env.OPENAI_API_KEY }),
});

export const meetingsProcessing = inngest.createFunction(
  { id: "meethings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text());
    });

    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse<StreamTranscriptItem>(response);
    });

    const transcriptWithSpeakers = await step.run(
      "assign-speakers",
      async () => {
        const speakerIds = [
          ...new Set(transcript.map((item) => item.speaker_id)),
        ];

        const userSpeakers = await db
          .select()
          .from(user)
          .where(inArray(user.id, speakerIds))
          .then((users) =>
            users.map((user) => ({
              ...user,
            }))
          );

        const agentSpeakers = await db
          .select()
          .from(agents)
          .where(inArray(agents.id, speakerIds))
          .then((agents) => agents.map((agent) => ({ ...agent })));

        const speakers = [...userSpeakers, ...agentSpeakers];
        return transcript.map((item) => {
          const speaker = speakers.find(
            (speaker) => speaker.id === item.speaker_id
          );

          if (!speaker) {
            return {
              ...item,
              user: {
                name: "Unknown",
              },
            };
          }

          return {
            ...item,
            user: {
              name: speaker.name,
            },
          };
        });
      }
    );
    const { output } = await summarizer.run(
      "Summarize the following transcript:" +
        JSON.stringify(transcriptWithSpeakers)
    );
    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    });
  }
);

export const chatNewMessage = inngest.createFunction(
  { id: "chat/new-message" },
  { event: "chat/message.new" },
  async ({ event, step }) => {
    const { userId, channelId, text } = event.data;

    const { existingMeeting, existingAgent } = await step.run("fetch-data", async () => {
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

      if (!existingMeeting) {
        return { existingMeeting: null, existingAgent: null };
      }

      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId));

      return { existingMeeting, existingAgent: existingAgent || null };
    });

    if (!existingMeeting || !existingAgent) {
      return;
    }

    if (userId !== existingAgent.id) {
      const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:

      ${existingMeeting.summary}

      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:

      ${existingAgent.instructions}

      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.

      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.

      If the summary does not contain enough information to answer a question, politely let the user know.

      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.`;

      const channel = streamChat.channel("messaging", channelId);
      await channel.watch();

      const previousMessages = channel.state.messages
        .slice(-5)
        .filter((msg) =>msg.text && msg.text?.trim() !== "")
        .map<ChatCompletionMessageParam>((message) => ({
          role: message.user?.id === existingAgent.id ? "assistant" : "user",
          content: message.text || "",
        }));

      const GPTResponse = await step.run("generate-response", async () => {
        return openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: instructions,
            },
            ...previousMessages,
            {
              role: "user",
              content: text,
            },
          ],
        });
      });

      const GPTResponseText = GPTResponse.choices[0].message.content;
      if (!GPTResponseText) {
        return;
      }

      await step.run("send-message", async () => {
        const avatarUrl = generateAvatarUri({
          seed: existingAgent.name,
          variant: "botttsNeutral",
        });

        streamChat.upsertUser({
          id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUrl,
        });

        await channel.sendMessage({
          text: GPTResponseText,
          user: {
            id: existingAgent.id,
            name: existingAgent.name,
            image: avatarUrl,
          },
        });
      });
    }
  }
);
