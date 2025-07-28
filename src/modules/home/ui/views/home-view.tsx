"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const HomeView = () => {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) return <p>Loading...</p>;

  if (!session) return <p>You are not logged in.</p>;

  return (
    <div className="flex flex-col p-4 gap-y-4">
      <p>Logged in as {session.user.name}</p>
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/sign-in"),
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
