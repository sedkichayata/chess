import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function ReferralsInner() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const r = await fetch("/api/admin/referrals");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload) => {
      const r = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  });
  const remove = useMutation({
    mutationFn: async (code) => {
      const r = await fetch(
        `/api/admin/referrals/${encodeURIComponent(code)}`,
        { method: "DELETE" },
      );
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  });

  const [form, setForm] = useState({
    code: "",
    referrer_email: "",
    discount_percent: 10,
    usage_limit: null,
    expires_at: "",
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Referral Codes</h2>
      <p className="text-gray-600 mb-6">
        Create and manage referral codes. Discount applies once at checkout.
      </p>

      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">Create / Update Code</h3>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="CODE"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="referrer email (optional)"
            value={form.referrer_email}
            onChange={(e) =>
              setForm({ ...form, referrer_email: e.target.value })
            }
          />
          <input
            className="border rounded px-3 py-2"
            type="number"
            placeholder="discount %"
            value={form.discount_percent}
            onChange={(e) =>
              setForm({ ...form, discount_percent: Number(e.target.value) })
            }
          />
          <input
            className="border rounded px-3 py-2"
            type="number"
            placeholder="usage limit"
            value={form.usage_limit ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                usage_limit: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <input
            className="border rounded px-3 py-2"
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-black text-white"
          onClick={() =>
            upsert.mutate({ ...form, expires_at: form.expires_at || null })
          }
        >
          Save Code
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3">Code</th>
              <th className="p-3">Referrer</th>
              <th className="p-3">Discount %</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Expires</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(data?.codes || []).map((c) => (
              <tr key={c.code} className="border-b border-gray-100">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.referrer_email || "—"}</td>
                <td className="p-3">{c.discount_percent}%</td>
                <td className="p-3">
                  {c.used_count}/{c.usage_limit ?? "∞"}
                </td>
                <td className="p-3">
                  {c.expires_at ? new Date(c.expires_at).toLocaleString() : "—"}
                </td>
                <td className="p-3 text-right">
                  <button
                    className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                    onClick={() => remove.mutate(c.code)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ReferralsInner />
    </QueryClientProvider>
  );
}
