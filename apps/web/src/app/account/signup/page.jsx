"use client";
import React, { useState } from "react";
import useAuth from "@/utils/useAuth";
import SignInButton from "@/components/SignInButton";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in email and password");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      console.error("Sign-up error", err);
      const messages = {
        CredentialsSignin:
          "Invalid email or password. If you already have an account, sign in instead.",
        EmailCreateAccount:
          "This email can’t be used. It may already be registered.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method.",
        Configuration:
          "Sign-up isn’t working right now. Please try again later.",
      };
      setError(
        messages[err?.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Create account</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Use Google or email to create your account.
        </p>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
          <div className="overflow-hidden rounded-md border border-gray-200 px-3 py-2">
            <input
              type="text"
              name="name"
              placeholder="Your name (optional)"
              className="w-full bg-transparent outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="overflow-hidden rounded-md border border-gray-200 px-3 py-2">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full bg-transparent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="overflow-hidden rounded-md border border-gray-200 px-3 py-2">
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              className="w-full bg-transparent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={
              "w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition-colors " +
              (loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100")
            }
          >
            {loading ? "Creating..." : "Sign up with email"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <SignInButton provider="google" className="w-full justify-center" />

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href={`/account/signin${
              typeof window !== "undefined" ? window.location.search : ""
            }`}
            className="text-[#357AFF] hover:text-[#2E69DE]"
          >
            Sign in
          </a>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <a href="/" className="hover:underline">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
