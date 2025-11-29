"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminClubsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all"); // all, verified, unverified

  const { data: clubs, isLoading } = useQuery({
    queryKey: ["adminClubs"],
    queryFn: async () => {
      const res = await fetch("/api/clubs");
      const data = await res.json();
      return data.clubs || [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }) => {
      const res = await fetch(`/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminClubs"] });
      toast.success("Club status updated");
    },
    onError: () => {
      toast.error("Failed to update club");
    },
  });

  const filteredClubs =
    clubs?.filter((c) => {
      if (filter === "verified") return c.is_verified;
      if (filter === "unverified") return !c.is_verified;
      return true;
    }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clubs Management</h1>
          <p className="text-gray-500 mt-1">Review and verify master clubs</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unverified")}
            className={`px-4 py-2 rounded-md ${filter === "unverified" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
          >
            Unverified
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner/Master
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClubs.map((club) => (
                <tr key={club.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {club.cover_image_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={club.cover_image_url}
                            alt=""
                          />
                        ) : (
                          <Users size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {club.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {club.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {club.master_name || club.owner_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {club.master_name ? "Verified Master" : "User"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {club.monthly_price_cents > 0
                      ? `$${(club.monthly_price_cents / 100).toFixed(2)}`
                      : "Free"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${club.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {club.is_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {club.is_verified ? (
                      <button
                        onClick={() =>
                          verifyMutation.mutate({
                            id: club.id,
                            is_verified: false,
                          })
                        }
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <XCircle size={16} className="mr-1" /> Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          verifyMutation.mutate({
                            id: club.id,
                            is_verified: true,
                          })
                        }
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <CheckCircle size={16} className="mr-1" /> Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
