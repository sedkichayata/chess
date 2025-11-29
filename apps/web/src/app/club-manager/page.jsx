"use client";
import { useState } from "react";
import useUser from "@/utils/useUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Video, FileText, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export default function ClubManagerPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [activeTrack, setActiveTrack] = useState(null);

  const { data: myClubs, isLoading } = useQuery({
    queryKey: ["myClubs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/clubs?owner_id=${user.id}`);
      const data = await res.json();
      return data.clubs || [];
    },
  });

  const club = myClubs?.[0]; // Assuming one club per master for now

  const { data: clubDetails } = useQuery({
    queryKey: ["clubDetails", club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}`);
      return res.json();
    },
  });

  const createClubMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, owner_id: user.id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myClubs"] });
      toast.success("Club created!");
    },
    onError: () => toast.error("Failed to create club"),
  });

  const addContentMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/clubs/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubDetails"] });
      toast.success("Content added!");
    },
    onError: () => toast.error("Failed to add content"),
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  if (!club) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Create Your Chess Club</h1>
        <p className="text-gray-600 mb-8">
          Start your community, set your price, and teach your students.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            createClubMutation.mutate({
              name: formData.get("name"),
              description: formData.get("description"),
              monthly_price_cents: Number(formData.get("price")) * 100,
              cover_image_url:
                "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80", // default for now
            });
          }}
          className="bg-white p-6 rounded-lg shadow text-left space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Club Name
            </label>
            <input
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly Price ($)
            </label>
            <input
              name="price"
              type="number"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {createClubMutation.isLoading ? "Creating..." : "Create Club"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-gray-500">Manage your content and members</p>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          {club.is_verified ? "Verified" : "Pending Verification"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Tracks */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-4">Curriculum Tracks</h2>
          <div className="space-y-2">
            {clubDetails?.tracksWithContent?.map((track) => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track)}
                className={`w-full text-left p-3 rounded-md transition-colors ${activeTrack?.id === track.id ? "bg-blue-50 border-blue-200 border" : "hover:bg-gray-50"}`}
              >
                <div className="font-medium text-gray-900">{track.title}</div>
                <div className="text-xs text-gray-500">
                  {track.content?.length || 0} items
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          {activeTrack ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">{activeTrack.title}</h2>
              </div>

              {/* Add Content Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  addContentMutation.mutate({
                    track_id: activeTrack.id,
                    title: formData.get("title"),
                    type: formData.get("type"),
                    url: formData.get("url"),
                    body_text: formData.get("body"),
                    is_locked: true,
                  });
                  e.target.reset();
                }}
                className="bg-gray-50 p-4 rounded-md mb-8 border border-gray-200"
              >
                <h3 className="font-medium mb-3">Add New Content</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <input
                    name="title"
                    placeholder="Title"
                    required
                    className="border p-2 rounded"
                  />
                  <select name="type" className="border p-2 rounded">
                    <option value="video">Video</option>
                    <option value="pgn">PGN / Game</option>
                    <option value="article">Article</option>
                  </select>
                </div>
                <input
                  name="url"
                  placeholder="URL (e.g. YouTube or PGN link)"
                  className="border p-2 rounded w-full mb-3"
                />
                <textarea
                  name="body"
                  placeholder="Description or body text"
                  className="border p-2 rounded w-full mb-3"
                  rows={2}
                />
                <button className="bg-black text-white px-4 py-2 rounded text-sm hover:opacity-80">
                  Add Content
                </button>
              </form>

              {/* List Content */}
              <div className="space-y-3">
                {activeTrack.content?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      {item.type === "video" ? (
                        <Video size={18} className="mr-3 text-purple-600" />
                      ) : (
                        <FileText size={18} className="mr-3 text-blue-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {item.title}
                      </span>
                    </div>
                    {item.is_locked ? (
                      <Lock size={16} className="text-gray-400" />
                    ) : (
                      <Unlock size={16} className="text-green-500" />
                    )}
                  </div>
                ))}
                {(!activeTrack.content || activeTrack.content.length === 0) && (
                  <p className="text-gray-500 text-center py-4">
                    No content in this track yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>Select a track to manage content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
