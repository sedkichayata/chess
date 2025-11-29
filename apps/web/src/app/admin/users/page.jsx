import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

function UsersInner() {
  const [q, setQ] = useState("");

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["users", q],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const linkChess = useMutation({
    mutationFn: async ({ email, username }) => {
      const res = await fetch("/api/chesscom/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  const changeTier = useMutation({
    mutationFn: async ({ email, tier }) => {
      const res = await fetch("/api/subscriptions/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_tier", email, tier }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  const cancelPlatform = useMutation({
    mutationFn: async ({ stripe_subscription_id }) => {
      const res = await fetch("/api/subscriptions/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel_platform",
          stripe_subscription_id,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users & Subscriptions</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search by email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Search
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3">Email</th>
              <th className="p-3">Chess.com</th>
              <th className="p-3">ELO (R/B/Bu)</th>
              <th className="p-3">Platform</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.users || []).map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {u.chesscom_username || "—"}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  {[u.chess_rapid_elo, u.chess_blitz_elo, u.chess_bullet_elo]
                    .filter(Boolean)
                    .join(" / ") || "—"}
                </td>
                <td className="p-3">
                  {u.platform_status}{" "}
                  {u.platform_tier ? `(${u.platform_tier})` : ""}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
                      onClick={() => {
                        const username = prompt("Chess.com username");
                        if (!username) return;
                        linkChess.mutate({ email: u.email, username });
                      }}
                    >
                      Link chess.com
                    </button>
                    <button
                      className="px-3 py-2 rounded bg-gray-100 text-gray-900 text-sm"
                      onClick={() => {
                        const tier = prompt(
                          "Set platform tier (starter/pro/elite)",
                        );
                        if (!tier) return;
                        changeTier.mutate({ email: u.email, tier });
                      }}
                    >
                      Change tier
                    </button>
                    {u.platform_status === "active" &&
                      u.platform_stripe_subscription_id && (
                        <button
                          className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                          onClick={() => {
                            if (confirm("Cancel at period end?")) {
                              cancelPlatform.mutate({
                                stripe_subscription_id:
                                  u.platform_stripe_subscription_id,
                              });
                            }
                          }}
                        >
                          Cancel platform
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <UsersInner />
    </QueryClientProvider>
  );
}
