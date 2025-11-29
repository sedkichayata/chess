import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function PlansInner() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/platform-plans");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const upsertPlan = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/platform-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });

  const deletePlan = useMutation({
    mutationFn: async (tier) => {
      const res = await fetch(
        `/api/admin/platform-plans/${encodeURIComponent(tier)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });

  const [form, setForm] = useState({
    tier: "",
    price_cents: 999,
    description: "",
    is_active: true,
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Platform Plans</h2>
      <p className="text-gray-600 mb-6">
        Configure Starter / Pro / Elite pricing. Prices are in cents (e.g. 999 =
        $9.99).
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {(data?.plans || []).map((p) => (
          <div key={p.tier} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold capitalize">{p.tier}</div>
              <span
                className={`text-xs px-2 py-1 rounded ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {p.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${(p.price_cents / 100).toFixed(2)}/mo
            </div>
            <div className="text-gray-600 text-sm mt-1 min-h-[2rem]">
              {p.description || "—"}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="px-3 py-2 rounded bg-black text-white text-sm"
                onClick={() =>
                  setForm({
                    tier: p.tier,
                    price_cents: p.price_cents,
                    description: p.description || "",
                    is_active: p.is_active,
                  })
                }
              >
                Edit
              </button>
              <button
                className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                onClick={() => deletePlan.mutate(p.tier)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Create / Update Plan</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="tier (starter/pro/elite)"
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            type="number"
            placeholder="price_cents"
            value={form.price_cents}
            onChange={(e) =>
              setForm({ ...form, price_cents: Number(e.target.value) })
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            <label htmlFor="active">Active</label>
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-black text-white"
          onClick={() => upsertPlan.mutate(form)}
        >
          Save Plan
        </button>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <PlansInner />
    </QueryClientProvider>
  );
}
