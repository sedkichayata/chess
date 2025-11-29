"use client";
import React, { useCallback, useState } from "react";
import useAuth from "@/utils/useAuth";
import useUser from "@/utils/useUser";

export default function SignInButton({ provider = "google", className = "" }) {
  const { signInWithGoogle, signInWithCredentials, signOut } = useAuth();
  const { user, loading } = useUser();
  const [isWorking, setIsWorking] = useState(false);

  const handleSignIn = useCallback(async () => {
    try {
      setIsWorking(true);
      const callbackUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      if (provider === "google") {
        await signInWithGoogle({ callbackUrl });
        return;
      }
      await signInWithCredentials({ callbackUrl });
    } catch (err) {
      console.error("Sign-in failed", err);
      alert("Could not sign in. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }, [provider, signInWithGoogle, signInWithCredentials]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsWorking(true);
      await signOut();
    } catch (err) {
      console.error("Sign-out failed", err);
      alert("Could not sign out. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }, [signOut]);

  const label = user ? "Sign out" : "Sign in";
  const onClick = user ? handleSignOut : handleSignIn;
  const disabled = loading || isWorking;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors " +
        (disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed "
          : "bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 ") +
        className
      }
      aria-busy={disabled}
    >
      {disabled ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
      ) : null}
      <span>{label}</span>
    </button>
  );
}
