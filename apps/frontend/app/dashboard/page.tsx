"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock3,
  Globe,
  Moon,
  Plus,
  Radio,
  Server,
  Sun,
  Vote,
  Waves,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useWebsites } from "@/hooks/useWebsites";
import { API_BACKEND_URL } from "@/config";

type UptimeStatus = "good" | "bad" | "unknown";

interface ProcessedWebsite {
  id: string;
  url: string;
  status: UptimeStatus;
  uptimePercentage: number;
  lastChecked: string;
  uptimeTicks: UptimeStatus[];
}

interface ValidatorNode {
  id: string;
  region: string;
  lastSeen: string;
  successRate: string;
  averageLatency: string;
  status: "healthy" | "lagging" | "offline";
}

interface EventItem {
  id: string;
  type: string;
  message: string;
  time: string;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

function getStatusText(status: UptimeStatus) {
  if (status === "good") return "Operational";
  if (status === "bad") return "Down";
  return "No data";
}

function getMonitorStatusClasses(status: UptimeStatus) {
  if (status === "good") {
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-300",
      soft: "text-emerald-400",
    };
  }

  if (status === "bad") {
    return {
      dot: "bg-rose-400",
      text: "text-rose-300",
      soft: "text-rose-400",
    };
  }

  return {
    dot: "bg-zinc-500",
    text: "text-zinc-300",
    soft: "text-zinc-400",
  };
}

function getValidatorStatusClasses(status: ValidatorNode["status"]) {
  if (status === "healthy") {
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-300",
      label: "Healthy",
    };
  }

  if (status === "lagging") {
    return {
      dot: "bg-amber-400",
      text: "text-amber-300",
      label: "Lagging",
    };
  }

  return {
    dot: "bg-zinc-500",
    text: "text-zinc-400",
    label: "Offline",
  };
}

function StatusDot({ className }: { className: string }) {
  return <span className={cx("h-2.5 w-2.5 rounded-full", className)} />;
}

function UptimeStrip({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex items-center gap-1">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={cx(
            "h-1.5 flex-1 rounded-full",
            tick === "good" && "bg-emerald-400",
            tick === "bad" && "bg-rose-400",
            tick === "unknown" && "bg-zinc-700"
          )}
        />
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={cx("text-2xl font-semibold tracking-tight text-zinc-100", valueClassName)}>
        {value}
      </p>
      {hint ? <p className="text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function AddWebsiteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: (url: string | null) => void;
}) {
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md border border-zinc-800 bg-[#111214] p-6 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-100">Add website</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Add a public endpoint to the monitoring network.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-zinc-700 bg-[#0d0e10] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onClose(null)}
            className="border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => onClose(url)}
            className="bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function WebsiteRow({ website }: { website: ProcessedWebsite }) {
  const [expanded, setExpanded] = useState(false);
  const hostname = getHostname(website.url);
  const statusStyles = getMonitorStatusClasses(website.status);

  return (
    <div className="border-b border-zinc-900 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full px-4 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_0.9fr_0.9fr_0.9fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <StatusDot className={statusStyles.dot} />
              <p className="truncate text-sm font-medium text-zinc-100">{hostname}</p>
            </div>
            <p className="mt-1 truncate pl-[22px] text-sm text-zinc-500">{website.url}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
              Status
            </p>
            <p className={cx("text-sm", statusStyles.text)}>{getStatusText(website.status)}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
              Uptime
            </p>
            <p className="text-sm text-zinc-200">{website.uptimePercentage.toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
              Consensus
            </p>
            <p className="text-sm text-zinc-400">
              {website.status === "unknown" ? "Awaiting votes" : "Majority vote"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <p className="text-sm text-zinc-500">{website.lastChecked}</p>
            <div className="text-zinc-500">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="ml-[22px] border-l border-zinc-800 pl-4">
            <div className="max-w-xl">
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Last 30 minutes</span>
                <span>Consensus windows</span>
              </div>
              <UptimeStrip ticks={website.uptimeTicks} />
            </div>

            <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-3">
              <p>
                Current state: <span className={statusStyles.soft}>{getStatusText(website.status)}</span>
              </p>
              <p>
                Decision mode: <span className="text-zinc-200">Majority vote</span>
              </p>
              <p>
                Last activity: <span className="text-zinc-200">{website.lastChecked}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ValidatorRow({ validator }: { validator: ValidatorNode }) {
  const s = getValidatorStatusClasses(validator.status);

  return (
    <div className="grid gap-4 border-b border-zinc-900 px-4 py-4 last:border-b-0 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.8fr] lg:items-center">
      <div className="flex items-center gap-3">
        <StatusDot className={s.dot} />
        <div>
          <p className="text-sm font-medium text-zinc-100">{validator.id}</p>
          <p className="text-sm text-zinc-500">{validator.region}</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
          Last seen
        </p>
        <p className="text-sm text-zinc-400">{validator.lastSeen}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
          Success rate
        </p>
        <p className="text-sm text-zinc-200">{validator.successRate}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
          Avg latency
        </p>
        <p className="text-sm text-zinc-200">{validator.averageLatency}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:hidden">
          Status
        </p>
        <p className={cx("text-sm", s.text)}>{s.label}</p>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: EventItem }) {
  const icon =
    event.type === "consensus" ? (
      <Vote className="h-4 w-4" />
    ) : event.type === "validator" ? (
      <Server className="h-4 w-4" />
    ) : event.type === "socket" ? (
      <Waves className="h-4 w-4" />
    ) : (
      <Activity className="h-4 w-4" />
    );

  return (
    <div className="border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">{icon}</span>
          <p className="text-sm font-medium text-zinc-100">{event.message}</p>
        </div>
        <span className="text-xs text-zinc-600">{event.time}</span>
      </div>
      <p className="pl-7 text-sm leading-6 text-zinc-500">{event.type}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { websites, refreshWebsites } = useWebsites();
  const { getToken } = useAuth();

  const processedWebsites = useMemo<ProcessedWebsite[]>(() => {
    return websites.map((website) => {
      const sortedTicks = [...website.ticks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentTicks = sortedTicks.filter(
        (tick) => new Date(tick.createdAt) > thirtyMinutesAgo
      );

      const windows: UptimeStatus[] = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);

        const windowTicks = recentTicks.filter((tick) => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        const upTicks = windowTicks.filter((tick) => tick.status === "Good").length;

        windows[9 - i] =
          windowTicks.length === 0
            ? "unknown"
            : upTicks / windowTicks.length >= 0.5
              ? "good"
              : "bad";
      }

      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter((tick) => tick.status === "Good").length;
      const uptimePercentage = totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

      const currentStatus = windows[windows.length - 1];
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : "Never";

      return {
        id: website.id,
        url: website.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        uptimeTicks: windows,
      };
    });
  }, [websites]);

  const validatorNodes = useMemo<ValidatorNode[]>(
    () => [
      {
        id: "validator-a",
        region: "Mumbai",
        lastSeen: "3s ago",
        successRate: "99.4%",
        averageLatency: "183ms",
        status: "healthy",
      },
      {
        id: "validator-b",
        region: "Singapore",
        lastSeen: "6s ago",
        successRate: "98.9%",
        averageLatency: "201ms",
        status: "healthy",
      },
      {
        id: "validator-c",
        region: "Frankfurt",
        lastSeen: "22s ago",
        successRate: "96.8%",
        averageLatency: "289ms",
        status: "lagging",
      },
    ],
    []
  );

  const events = useMemo<EventItem[]>(
    () => [
      {
        id: "1",
        type: "consensus",
        message: "Consensus marked api.atlas-uptime.dev operational",
        time: "2s ago",
      },
      {
        id: "2",
        type: "validator",
        message: "validator-b submitted signed health result from Singapore",
        time: "7s ago",
      },
      {
        id: "3",
        type: "socket",
        message: "Realtime dashboard stream connected",
        time: "12s ago",
      },
      {
        id: "4",
        type: "monitor",
        message: "status.atlas-uptime.dev received mixed validator responses",
        time: "19s ago",
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const total = processedWebsites.length;
    const healthy = processedWebsites.filter((site) => site.status === "good").length;
    const down = processedWebsites.filter((site) => site.status === "bad").length;

    const avgUptime =
      total === 0
        ? 0
        : processedWebsites.reduce((sum, site) => sum + site.uptimePercentage, 0) / total;

    const activeValidators = validatorNodes.filter((node) => node.status !== "offline").length;

    return {
      total,
      healthy,
      down,
      avgUptime,
      activeValidators,
    };
  }, [processedWebsites, validatorNodes]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-zinc-900 pb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-zinc-500">
                <Activity className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.18em]">
                  Distributed monitoring
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                Atlas Uptime
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Consensus-aware monitor health, validator visibility, and realtime operational flow.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="border border-zinc-800 p-2.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                Add website
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-8 border-b border-zinc-900 py-8 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Monitors" value={String(stats.total)} />
          <Metric label="Operational" value={String(stats.healthy)} />
          <Metric
            label="Down"
            value={String(stats.down)}
            valueClassName={stats.down > 0 ? "text-rose-300" : "text-zinc-100"}
          />
          <Metric label="Validators" value={String(stats.activeValidators)} hint="Active nodes" />
          <Metric label="Average uptime" value={`${stats.avgUptime.toFixed(1)}%`} />
        </section>

        <section className="py-8">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Monitored websites
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
              Consensus-based monitor state
            </h2>
          </div>

          <div className="mb-4 hidden grid-cols-[minmax(0,2.2fr)_0.9fr_0.9fr_0.9fr_auto] gap-4 border-b border-zinc-900 pb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:grid">
            <div>Website</div>
            <div>Status</div>
            <div>Uptime</div>
            <div>Decision</div>
            <div>Last check</div>
          </div>

          {processedWebsites.length === 0 ? (
            <div className="border border-dashed border-zinc-800 px-6 py-12 text-center">
              <h3 className="text-lg font-medium text-zinc-100">No websites yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                Add a website to start tracking validator-backed uptime checks.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                Add first website
              </button>
            </div>
          ) : (
            <div className="border border-zinc-900">
              {processedWebsites.map((website) => (
                <WebsiteRow key={website.id} website={website} />
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-zinc-900 py-8">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Validator nodes
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
              Node health and metadata
            </h2>
          </div>

          <div className="mb-4 hidden grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.8fr] gap-4 border-b border-zinc-900 pb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600 lg:grid">
            <div>Validator</div>
            <div>Last seen</div>
            <div>Success rate</div>
            <div>Avg latency</div>
            <div>Status</div>
          </div>

          <div className="border border-zinc-900">
            {validatorNodes.map((validator) => (
              <ValidatorRow key={validator.id} validator={validator} />
            ))}
          </div>
        </section>
      </div>

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={async (url) => {
          if (url === null) {
            setIsModalOpen(false);
            return;
          }

          try {
            const token = await getToken();

            await axios.post(
              `${API_BACKEND_URL}/api/v1/website`,
              { url },
              {
                headers: {
                  Authorization: token,
                },
              }
            );

            setIsModalOpen(false);
            refreshWebsites();
          } catch (error) {
            console.error(error);
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
}