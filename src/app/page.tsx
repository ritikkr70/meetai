"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/client";

// ✅ Create the auth client
const authClient = createAuthClient();

// ✅ Define session types inline
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



export default function Home() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ✅ Load session on mount
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      alert("Sign Up Failed: " + error.message);
    } else {
      alert("Sign Up Success");
      window.location.reload();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await authClient.signIn.email({ email: loginEmail, password: loginPassword });

    if (error) {
      alert("Login Failed: " + error.message);
    } else {
      alert("Login Success");
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setSession(null);
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading session...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md w-96 text-center space-y-4">
          <h1 className="text-xl font-bold">Welcome, {session.user.name}</h1>
          <p className="text-gray-600">Logged in as {session.user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen gap-10 p-6">
      {/* Sign Up Form */}
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign Up
          </button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
