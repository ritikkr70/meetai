"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type SessionData = {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    image?: string | null;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: string | Date;
    ipAddress?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    token: string;
    userAgent?: string | null;
    country?: string | null;
  };
};

const HomeView = () => {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true);
      const result = await authClient.getSession();
      if ("data" in result && result.data) {
        setSession(result.data as SessionData);
      } else {
        setSession(null);
      }
      setIsLoading(false);
    }

    fetchSession();
  }, []);

  if (isLoading) return <p>Loading...</p>;

  if (!session) return <p>You are not logged in.</p>;

  return (
    <div className="flex flex-col p-4 gap-y-4">
      <p>Logged in as {session.user.name}</p>
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/sign-in");
              },
            },
          })
        }
      >
        Logout
      </Button>
    </div>
  );
};

export default HomeView;
