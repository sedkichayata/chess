import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

function DashboardInner() {
  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/platform-plans");
      if (!res.ok) throw new Error("Failed to load plans");
      return res.json();
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome</h2>
        <p className="text-gray-600">
          Manage pricing, referral codes, masters, users, and subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Active Plans</div>
          <div className="text-3xl font-bold mt-1">
            {plansQuery.data?.plans?.filter((p) => p.is_active).length ?? "—"}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-3xl font-bold mt-1">
            {usersQuery.data?.users?.length ?? "—"}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Chess.com</div>
          <div className="text-sm mt-1 text-gray-600">
            Link users to chess.com to fetch ratings and history
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/admin/plans"
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <h3 className="font-semibold">Configure Platform Plans</h3>
          <p className="text-gray-600 text-sm mt-1">
            Starter / Pro / Elite pricing and descriptions
          </p>
        </a>
        <a
          href="/admin/referrals"
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <h3 className="font-semibold">Manage Referral Codes</h3>
          <p className="text-gray-600 text-sm mt-1">
            Create, edit, and expire referral codes
          </p>
        </a>
        <a
          href="/admin/masters"
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <h3 className="font-semibold">Masters Pricing</h3>
          <p className="text-gray-600 text-sm mt-1">
            Set monthly price per master
          </p>
        </a>
        <a
          href="/admin/users"
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <h3 className="font-semibold">Users & Subscriptions</h3>
          <p className="text-gray-600 text-sm mt-1">
            Search by email, link chess.com, manage platform tier
          </p>
        </a>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <DashboardInner />
    </QueryClientProvider>
  );
}
