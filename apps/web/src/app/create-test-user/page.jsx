"use client";

import { useState } from "react";

export default function CreateTestUserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const createTestUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/create-test-user", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to create test user",
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create Test User
        </h1>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Click the button below to create a test user that you can use to
            sign in and test the app.
          </p>

          <button
            onClick={createTestUser}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Test User"}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">Error:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {result && result.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-green-800 font-medium mb-2">✅ Success!</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> {result.credentials.email}
                </p>
                <p>
                  <strong>Password:</strong>{" "}
                  <code className="bg-white px-1 rounded">
                    {result.credentials.password}
                  </code>
                </p>
                <p>
                  <strong>Name:</strong> {result.appUser?.name}
                </p>
                <p>
                  <strong>User ID:</strong> {result.appUser?.id}
                </p>

                {result.stripe && result.stripe.created ? (
                  <p className="text-green-700">
                    <strong>Stripe Customer:</strong> {result.stripe.id} (
                    {result.stripe.mode} mode)
                  </p>
                ) : (
                  <p className="text-amber-700">
                    <strong>Stripe:</strong>{" "}
                    {result.stripe?.mode === "absent"
                      ? "Not Configured (Payments will fail)"
                      : "Created/Linked"}
                  </p>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 font-medium">Next Steps:</p>
                  <ol className="text-blue-700 text-xs mt-1 list-decimal list-inside space-y-1">
                    <li>Go to the sign-in page</li>
                    <li>
                      Use email:{" "}
                      <code className="bg-white px-1 rounded">
                        {result.credentials.email}
                      </code>
                    </li>
                    <li>
                      Use password:{" "}
                      <code className="bg-white px-1 rounded">
                        {result.credentials.password}
                      </code>
                    </li>
                  </ol>
                  <div className="mt-2 text-center">
                    <a
                      href="/account/signin"
                      className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      Go to Sign In
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This creates a user in your database and optionally a test Stripe
            customer.
          </p>
        </div>
      </div>
    </div>
  );
}
