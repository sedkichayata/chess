"use client";
import React, { useState } from "react";
import useAuth from "@/utils/useAuth";
import SignInButton from "@/components/SignInButton";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      console.error("Sign-in error", err);
      const messages = {
        OAuthSignin:
          "Couldn’t start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn’t create an account with this method. Try another option.",
        EmailCreateAccount: "This email can’t be used to create an account.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method.",
        CredentialsSignin: "Incorrect email or password. Try again.",
        AccessDenied: "You don’t have permission to sign in.",
        Configuration:
          "Sign-in isn’t working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
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
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Use Google or email to sign in.
        </p>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
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
              placeholder="Your password"
              className="w-full bg-transparent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
            {loading ? "Signing in..." : "Sign in with email"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <SignInButton provider="google" className="w-full justify-center" />

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href={`/account/signup${
              typeof window !== "undefined" ? window.location.search : ""
            }`}
            className="text-[#357AFF] hover:text-[#2E69DE]"
          >
            Create one
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
