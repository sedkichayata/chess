"use client";
import React, { useCallback, useState } from "react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSignOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut({ callbackUrl: "/", redirect: true });
    } catch (e) {
      console.error(e);
      setError("Could not sign out. Please try again.");
      setLoading(false);
    }
  }, [signOut]);

  return (
    <div className="min-h-screen w-full bg-white text-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign out</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          You’ll be sent back to the homepage.
        </p>
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onSignOut}
          disabled={loading}
          className={
            "w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition-colors " +
            (loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100")
          }
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
        <div className="mt-6 text-center text-xs text-gray-400">
          <a href="/" className="hover:underline">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
