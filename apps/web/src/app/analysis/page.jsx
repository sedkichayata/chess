import { useEffect, useMemo, useState } from "react";
import useUser from "@/utils/useUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Target,
  Hourglass,
  AlertTriangle,
  Puzzle,
  Brain,
  Flag,
} from "lucide-react";

export default function AnalysisPage() {
  const { data: sessionUser, loading } = useUser();
  const queryClient = useQueryClient();

  const email = sessionUser?.email || null;

  const [analysisText, setAnalysisText] = useState("");
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);

  // Fetch the full user record to get chesscom username
  const {
    data: userRecord,
    isLoading: userLoading,
    error: userErr,
  } = useQuery({
    queryKey: ["userRecord", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        throw new Error(
          `Could not load user: [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    staleTime: 60_000,
  });

  const chessUsername = userRecord?.user?.chesscom_username || "";

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      const res = await fetch("/api/chesscom/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: chessUsername }),
      });
      // handle non-2xx
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to analyze");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysisText(data.analysis || "");
      setSkills(Array.isArray(data.skills) ? data.skills : []);
    },
    onError: (e) => {
      console.error(e);
      setError("Could not analyze games. Please try again.");
    },
  });

  const saveSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error("Missing email");
      if (!skills?.length) throw new Error("Nothing to save yet");
      const res = await fetch("/api/analysis/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: chessUsername, skills }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skillHistory", email] });
    },
    onError: (e) => {
      console.error(e);
      setError("Could not save snapshot.");
    },
  });

  const {
    data: history,
    isLoading: histLoading,
    error: histErr,
  } = useQuery({
    queryKey: ["skillHistory", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await fetch(
        `/api/analysis/skills?email=${encodeURIComponent(email)}`,
      );
      if (!res.ok) {
        throw new Error(
          `Failed to load history: [${res.status}] ${res.statusText}`,
        );
      }
      return res.json();
    },
    staleTime: 60_000,
  });

  const skillsHistory = history?.skills || [];

  const renderIcon = (name) => {
    switch (name) {
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-[#111827] mr-2" />;
      case "Target":
        return <Target className="w-5 h-5 text-[#111827] mr-2" />;
      case "Hourglass":
        return <Hourglass className="w-5 h-5 text-[#111827] mr-2" />;
      case "AlertTriangle":
        return <AlertTriangle className="w-5 h-5 text-[#111827] mr-2" />;
      case "Puzzle":
        return <Puzzle className="w-5 h-5 text-[#111827] mr-2" />;
      case "Flag":
        return <Flag className="w-5 h-5 text-[#111827] mr-2" />;
      default:
        return <Brain className="w-5 h-5 text-[#111827] mr-2" />;
    }
  };

  const ProgressBar = ({ value }) => {
    const pct = Math.max(0, Math.min(100, Number(value || 0)));
    const color = pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444";
    return (
      <div className="w-full h-2 bg-gray-200 rounded-md overflow-hidden">
        <div
          style={{ width: `${pct}%`, backgroundColor: color }}
          className="h-full"
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-[#111827]">AI Coach Analysis</h1>
      <p className="text-sm text-gray-600 mt-1">
        Understand your strengths and weaknesses with clear visuals.
      </p>

      {loading || userLoading ? (
        <div className="mt-6 text-gray-700">Loading your profile…</div>
      ) : !email ? (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          You need to sign in to run analysis.{" "}
          <a className="underline" href="/account/signin">
            Sign in
          </a>
        </div>
      ) : !chessUsername ? (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded">
          Link your Chess.com username on your Profile first.
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isLoading}
            className="inline-flex items-center px-4 py-2 rounded-md bg-[#111827] text-white hover:opacity-90 disabled:opacity-70"
          >
            {analyzeMutation.isLoading ? "Analyzing…" : "Analyze last 50 games"}
          </button>
          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        </div>
      )}

      {/* Skills grid */}
      {skills?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#111827] mb-3">
            Skills Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((s, idx) => (
              <div
                key={s.key || s.label || idx}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center mb-2">
                  {renderIcon(s.icon)}
                  <div className="flex-1 font-semibold text-[#111827]">
                    {s.label || s.key}
                  </div>
                  <div className="text-sm text-gray-700">
                    {Math.round(s.score ?? 0)}/100
                  </div>
                </div>
                <ProgressBar value={s.score} />
                {s.tip ? (
                  <div className="text-sm text-gray-600 mt-2">{s.tip}</div>
                ) : null}
              </div>
            ))}
          </div>

          <button
            onClick={() => saveSnapshotMutation.mutate()}
            disabled={saveSnapshotMutation.isLoading}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-[#111827] text-white hover:opacity-90 disabled:opacity-70"
          >
            {saveSnapshotMutation.isLoading ? "Saving…" : "Save snapshot"}
          </button>
        </div>
      )}

      {/* Summary */}
      {analysisText && (
        <div className="mt-8 border-l-4 border-[#7C3AED] bg-white rounded p-4">
          <div className="text-gray-700 whitespace-pre-wrap">
            {analysisText}
          </div>
        </div>
      )}

      {/* History charts */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-[#111827] mb-3">
          Skill History
        </h2>
        {!email ? null : histLoading ? (
          <div className="text-gray-700">Loading history…</div>
        ) : (skillsHistory?.length || 0) === 0 ? (
          <div className="text-gray-500">
            No snapshots yet. Analyze and save to start tracking.
          </div>
        ) : (
          <div className="space-y-6">
            {skillsHistory.map((sk) => {
              const points = (sk.points || []).map((p) => ({
                date: new Date(p.date),
                value: Number(p.value || 0),
              }));
              return (
                <SkillChart
                  key={sk.key}
                  label={sk.label || sk.key}
                  points={points}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Small chart using a simple SVG polyline (no external chart lib required)
function SkillChart({ label, points }) {
  // Build a simple responsive sparkline by hand to avoid extra deps
  const w = 700;
  const h = 180;
  const pad = 24;
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.value);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(100, ...ys);
  const xStep = xs.length > 1 ? (w - pad * 2) / (xs.length - 1) : 0;
  const yScale = (val) => {
    if (maxY === minY) return h / 2;
    return h - pad - ((val - minY) / (maxY - minY)) * (h - pad * 2);
  };
  const lineD = points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${pad + i * xStep},${yScale(p.value)}`,
    )
    .join(" ");

  return (
    <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Brain className="w-5 h-5 text-[#111827] mr-2" />
        <div className="font-semibold text-[#111827]">{label}</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
        {/* Grid */}
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="#E5E7EB"
        />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#E5E7EB" />
        {/* Path */}
        <path d={lineD} fill="none" stroke="#7C3AED" strokeWidth="2" />
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={pad + i * xStep}
            cy={yScale(p.value)}
            r="3"
            fill="#7C3AED"
          />
        ))}
      </svg>
      <div className="text-xs text-gray-500 mt-1">
        Most recent {points.length} snapshots
      </div>
    </div>
  );
}
