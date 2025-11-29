import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function MastersInner() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["masters"],
    queryFn: async () => {
      const r = await fetch("/api/masters");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, monthly_price }) => {
      const r = await fetch(`/api/admin/masters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_price }),
      });
      if (!r.ok) throw new Error("Failed to update");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["masters"] }),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Masters Pricing</h2>
      <p className="text-gray-600 mb-6">
        Update a master's monthly subscription price.
      </p>

      <div className="border border-gray-200 rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3">Name</th>
              <th className="p-3">Title</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Monthly Price</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(data?.masters || []).map((m) => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="p-3 font-semibold">{m.name}</td>
                <td className="p-3">{m.title || "—"}</td>
                <td className="p-3">{m.rating || "—"}</td>
                <td className="p-3">${Number(m.monthly_price).toFixed(2)}</td>
                <td className="p-3 text-right">
                  <button
                    className="px-3 py-2 rounded bg-black text-white text-sm"
                    onClick={() => {
                      const nv = prompt(
                        "New monthly price ($)",
                        String(m.monthly_price),
                      );
                      if (!nv) return;
                      const amount = Number(nv);
                      if (Number.isNaN(amount)) return alert("Invalid number");
                      update.mutate({ id: m.id, monthly_price: amount });
                    }}
                  >
                    Update
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

export default function MastersPage() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <MastersInner />
    </QueryClientProvider>
  );
}
