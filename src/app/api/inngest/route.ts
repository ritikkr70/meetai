import { inngest } from "@/inngest/client";
import { meetingsProcessing, chatNewMessage } from "@/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves the functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [meetingsProcessing, chatNewMessage],
});
