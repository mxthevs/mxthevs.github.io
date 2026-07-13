import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GitCommit, 
  GitPullRequest, 
  Flame, 
  Activity, 
  Terminal, 
  Info, 
  Sliders, 
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  ServerCrash,
  Sparkles
} from "lucide-react";
import GlassCard from "@/src/components/ui/GlassCard";
import { cn } from "@/src/lib/utils";
import { getContributionCommits, NormalizedCommit } from "@/src/lib/github";
import { useTranslation } from "react-i18next";

interface DayData {
  date: Date;
  dateStr: string;
  count: number;
  isFuture: boolean;
}

type TimeRange = "last-12-months" | "2025" | "2024";

export default function Contributions() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>("last-12-months");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [contributionData, setContributionData] = useState<Record<string, number>>({});
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Real github commits integration state
  const [loadingDayCommits, setLoadingDayCommits] = useState<boolean>(false);
  const [dayCommitsError, setDayCommitsError] = useState<string | null>(null);
  const [realDayCommits, setRealDayCommits] = useState<NormalizedCommit[]>([]);
  const [privateCommitsCount, setPrivateCommitsCount] = useState<number>(0);
  const [loadingStep, setLoadingStep] = useState<"repos" | "commits" | "done">("done");
  const [loadingProgress, setLoadingProgress] = useState<{ loaded: number; total: number } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const GITHUB_USERNAME = "mxthevs";

  // Anchor date (dynamically set to current date/time when loading the website)
  const anchorDate = useMemo(() => new Date(), []);

  // Fetch real mxthevs contributions on mount
  useEffect(() => {
    let active = true;
    async function loadGithubData() {
      try {
        const response = await fetch("https://github-contributions-api.deno.dev/mxthevs.json?flat=true");
        if (!response.ok) {
          throw new Error("Source provider status code " + response.status);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.contributions)) {
          throw new Error("Invalid contributions format");
        }

        const counts: Record<string, number> = {};
        data.contributions.forEach((item: any) => {
          if (item.date) {
            counts[item.date] = Number(item.contributionCount) || 0;
          }
        });

        if (active) {
          setContributionData(counts);
          setLoading(false);
          setError(false);
        }
      } catch (err) {
        console.error("Contributions integration error:", err);
        if (err instanceof Error) {
          console.error("Contributions integration error stack trace:", err.stack);
        }
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadGithubData();
    return () => {
      active = false;
    };
  }, []);

  // Generate the full calendar grid (53 weeks * 7 days) mapped to the API counts
  const weeks = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    if (timeRange === "last-12-months") {
      const dayOfWeek = anchorDate.getDay();
      endDate = new Date(anchorDate);
      endDate.setDate(anchorDate.getDate() + (6 - dayOfWeek));
      
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 370);
    } else {
      const year = parseInt(timeRange, 10);
      const Jan1 = new Date(`${year}-01-01T12:00:00`);
      const dayOfWeekJan1 = Jan1.getDay();
      
      startDate = new Date(Jan1);
      startDate.setDate(Jan1.getDate() - dayOfWeekJan1);

      const Dec31 = new Date(`${year}-12-31T12:00:00`);
      const dayOfWeekDec31 = Dec31.getDay();
      endDate = new Date(Dec31);
      endDate.setDate(Dec31.getDate() + (6 - dayOfWeekDec31));
    }

    const days: DayData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const isFuture = current > anchorDate;

      const count = isFuture ? 0 : (contributionData[dateStr] || 0);

      days.push({
        date: new Date(current),
        dateStr,
        count,
        isFuture
      });

      current.setDate(current.getDate() + 1);
    }

    const groupedWeeks: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      groupedWeeks.push(days.slice(i, i + 7));
    }

    return groupedWeeks;
  }, [timeRange, contributionData, anchorDate]);

  // Recalculate summary metrics based on real fetched data
  const stats = useMemo(() => {
    const flatDays = weeks.flat();
    let total = 0;
    let activeDaysCount = 0;
    let maxStreak = 0;
    let currentStreak = 0;
    let trackedStreak = 0;
    let validNonFutureDays = 0;

    const ordered = [...flatDays].sort((a, b) => a.date.getTime() - b.date.getTime());

    ordered.forEach((d) => {
      if (d.isFuture) return;
      validNonFutureDays++;
      total += d.count;

      if (d.count > 0) {
        activeDaysCount++;
        trackedStreak++;
        if (trackedStreak > maxStreak) {
          maxStreak = trackedStreak;
        }
      } else {
        trackedStreak = 0;
      }
    });

    let streakWorkingBack = 0;
    const historyBackwards = ordered.filter(d => !d.isFuture).reverse();

    for (let i = 0; i < historyBackwards.length; i++) {
      const d = historyBackwards[i];
      if (i === 0 && d.count === 0) {
        continue;
      }
      if (d.count > 0) {
        streakWorkingBack++;
      } else {
        if (streakWorkingBack > 0) {
          break;
        }
      }
    }

    currentStreak = streakWorkingBack;
    const consistencyRate = validNonFutureDays > 0 ? (activeDaysCount / validNonFutureDays) * 100 : 0;

    return {
      total,
      consistencyRate,
      longestStreak: maxStreak,
      currentStreak
    };
  }, [weeks]);

  // Month Headings to align on the x-axis
  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = [];
    let prevMonth = -1;

    weeks.forEach((week, i) => {
      const middleDay = week[3] || week[0];
      const month = middleDay.date.getMonth();

      if (month !== prevMonth) {
        prevMonth = month;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        labels.push({
          label: monthNames[month],
          index: i
        });
      }
    });

    return labels;
  }, [weeks]);

  // Clean, high-contrast monochrome silver/black theme
  const getCellStyles = (day: DayData) => {
    if (day.isFuture) {
      return "bg-white/[0.01] border border-white/[0.02] cursor-not-allowed opacity-30";
    }

    const { count } = day;

    if (count === 0) {
      return "bg-zinc-950/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/50";
    }

    if (count === 1) return "bg-zinc-800/40 border border-zinc-700/20 hover:bg-zinc-800/60 text-zinc-400";
    if (count === 2) return "bg-zinc-600/40 border border-zinc-500/30 hover:bg-zinc-600/60 text-zinc-300";
    if (count === 3) return "bg-zinc-400/40 border border-zinc-300/40 hover:bg-zinc-400/60 text-zinc-100";
    return "bg-white border border-zinc-200 hover:bg-zinc-200 text-black";
  };

  // Cleanup any outstanding requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleCellClick = (day: DayData) => {
    if (day.isFuture) return;

    // Cancel any existing active fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setSelectedDay(day);

    if (day.count === 0) {
      setRealDayCommits([]);
      setPrivateCommitsCount(0);
      setLoadingDayCommits(false);
      setDayCommitsError(null);
      return;
    }

    setLoadingDayCommits(true);
    setDayCommitsError(null);
    setRealDayCommits([]);
    setPrivateCommitsCount(0);
    setLoadingStep("repos");
    setLoadingProgress(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    getContributionCommits(
      GITHUB_USERNAME,
      day.dateStr,
      (progress) => {
        setLoadingStep(progress.step);
        if (progress.loadedRepos !== undefined && progress.totalRepos !== undefined) {
          setLoadingProgress({ loaded: progress.loadedRepos, total: progress.totalRepos });
        }
      },
      controller.signal
    )
      .then(({ commits }) => {
        setRealDayCommits(commits);
        // Compare found commits with total calendar count
        const foundCommits = commits.length;
        const privateCount = Math.max(0, day.count - foundCommits);
        setPrivateCommitsCount(privateCount);
        setLoadingDayCommits(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Ignored because request was intentionally cancelled
          return;
        }
        console.error("Error loading day commits:", err);
        if (err instanceof Error) {
          console.error("Error loading day commits stack trace:", err.stack);
        }
        setDayCommitsError(err.message || "Failed to retrieve commits from GitHub.");
        setLoadingDayCommits(false);
      });
  };

  return (
    <section id="activity" className="w-full py-16 px-4 relative z-10">
      <div className="mx-auto max-w-5xl">
        
        {/* Section Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              {t("activity.live_activity")}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t("activity.title")}
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-lg">
              {t("activity.subtitle")}
            </p>
          </div>

          {!loading && !error && (
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-[10px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("activity.filter_active")}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <p className="text-zinc-500 font-mono text-xs animate-pulse">{t("activity.compiling")}</p>
          </div>
        ) : error ? (
          /* Robust elegant fallback view if GitHub API is offline or rate-limited */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="p-8 border-zinc-800/40 overflow-hidden relative" hoverGlow={false} animateEntrance={false}>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <ServerCrash className="h-32 w-32 text-white" />
              </div>

              <div className="flex items-center gap-3 border-b border-white/[0.03] pb-5 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-400">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{t("activity.source_flow")}</div>
                  <h3 className="font-display text-lg font-bold text-white">{t("activity.fallback_title")}</h3>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
                  {t("activity.fallback_desc")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white">
                      <GitCommit className="h-4 w-4 text-zinc-400" />
                      <span className="font-display text-xs font-semibold">{t("activity.strategy_title")}</span>
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      {t("activity.strategy_desc")}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white">
                      <ShieldCheck className="h-4 w-4 text-zinc-400" />
                      <span className="font-display text-xs font-semibold">{t("activity.compliance_title")}</span>
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      {t("activity.compliance_desc")}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white">
                      <Activity className="h-4 w-4 text-zinc-400" />
                      <span className="font-display text-xs font-semibold">{t("activity.review_title")}</span>
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      {t("activity.review_desc")}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white">
                      <Terminal className="h-4 w-4 text-zinc-400" />
                      <span className="font-display text-xs font-semibold">{t("activity.test_title")}</span>
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      {t("activity.test_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 pt-3 border-t border-white/[0.03]">
                  <Info className="h-3.5 w-3.5 text-zinc-700" />
                  <span>{t("activity.tracker_offline")}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* Live Render Board */
          <>
            <GlassCard className="p-5 overflow-hidden" hoverGlow={false} animateEntrance={false}>
              
              {/* Top Panel Controls inside Grid Card */}
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-3.5 mb-6 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-zinc-500">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>mxthevs.contributions.sys</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-600 uppercase">
                  <Sparkles className="h-3 w-3 text-zinc-500 animate-pulse" />
                  <span>{t("activity.live_github_sync")}</span>
                </div>
              </div>

              {/* Canvas Scroll wrapper */}
              <div className="w-full overflow-x-auto select-none pb-2 scrollbar-thin scrollbar-track-zinc-950/20 scrollbar-thumb-zinc-800/80">
                <div className="min-w-[760px] pl-5 relative pr-2">
                  
                  {/* Month Headings Timeline Row */}
                  <div className="relative w-full h-5 text-[9px] font-mono text-zinc-500 mb-1.5">
                    {monthLabels.map((month) => (
                      <span
                        key={`${month.label}-${month.index}`}
                        className="absolute"
                        style={{ left: `${(month.index / weeks.length) * 100}%` }}
                      >
                        {month.label}
                      </span>
                    ))}
                  </div>

                  {/* Day Labels and Main Heatmap Cells */}
                  <div className="flex items-start gap-1">
                    
                    {/* Day of Week vertical index labels */}
                    <div 
                      className="grid h-[84px] text-[9px] font-mono text-zinc-600 mr-2.5 pt-1 pr-1 font-semibold"
                      style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
                    >
                      <span className="h-2.5 flex items-center">Sun</span>
                      <span className="h-2.5 flex items-center mt-1">Mon</span>
                      <span className="h-2.5 flex items-center mt-1">Tue</span>
                      <span className="h-2.5 flex items-center mt-1">Wed</span>
                      <span className="h-2.5 flex items-center mt-1">Thu</span>
                      <span className="h-2.5 flex items-center mt-1">Fri</span>
                      <span className="h-2.5 flex items-center mt-1">Sat</span>
                    </div>

                    {/* Weeks grid */}
                    <div 
                      className="flex-1 grid gap-1 relative"
                      style={{ gridTemplateColumns: "repeat(53, minmax(0, 1fr))" }}
                    >
                      {weeks.map((week, weekIdx) => (
                        <div 
                          key={`week-${weekIdx}`} 
                          className="grid gap-1"
                          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
                        >
                          {week.map((day) => {
                            const isSelected = selectedDay?.dateStr === day.dateStr;
                            const isLoadingThis = loadingDayCommits && isSelected;
                            return (
                              <motion.div
                                key={day.dateStr}
                                onClick={() => handleCellClick(day)}
                                whileHover={!day.isFuture ? { scale: 1.25, zIndex: 10 } : {}}
                                className={cn(
                                  "h-2.5 w-2.5 rounded-[1.5px] transition-colors relative cursor-pointer",
                                  getCellStyles(day),
                                  isSelected && !isLoadingThis && "ring-2 ring-white scale-115 z-10 shadow-[0_0_8px_rgba(255,255,255,0.4)]",
                                  isLoadingThis && "animate-pulse ring-2 ring-amber-400 scale-115 z-10 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                )}
                                title={`${day.dateStr}: ${day.count} ${day.count === 1 ? t("activity.recorded_one") : t("activity.recorded_other")}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              </div>

              {/* Bottom legend metrics panel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-white/[0.03] pt-4 text-[10px] font-mono text-zinc-500">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 text-zinc-600" />
                  <span>{t("activity.legend_info")}</span>
                </div>

                <div className="flex items-center gap-1.5 select-none">
                  <span>{t("activity.less")}</span>
                  <div className="h-2.5 w-2.5 rounded-[1.5px] bg-zinc-950/40 border border-white/5" />
                  <div className="h-2.5 w-2.5 rounded-[1.5px] bg-zinc-800/40 border border-zinc-700/20" />
                  <div className="h-2.5 w-2.5 rounded-[1.5px] bg-zinc-600/40 border border-zinc-500/30" />
                  <div className="h-2.5 w-2.5 rounded-[1.5px] bg-zinc-400/40 border border-zinc-300/40" />
                  <div className="h-2.5 w-2.5 rounded-[1.5px] bg-white border border-zinc-200" />
                  <span>{t("activity.more")}</span>
                </div>
              </div>

            </GlassCard>

            {/* Selected Day Contribution Details Console Logger */}
            <AnimatePresence mode="wait">
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6"
                >
                  <GlassCard className="p-5 bg-black/60 font-mono text-xs border border-zinc-900/60" hoverGlow={false} animateEntrance={false}>
                    
                    {/* Header Terminal title bar */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 group/traffic select-none">
                          <button
                            onClick={() => setSelectedDay(null)}
                            className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] flex items-center justify-center transition-colors relative cursor-pointer outline-none focus:ring-1 focus:ring-red-400/50"
                            title="Close"
                          >
                            <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity text-[7px] text-[#4c0002] font-extrabold select-none leading-none pointer-events-none mb-[0.5px]">
                              ✕
                            </span>
                          </button>
                          <button
                            onClick={() => setSelectedDay(null)}
                            className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] flex items-center justify-center transition-colors relative cursor-pointer outline-none focus:ring-1 focus:ring-yellow-400/50"
                            title="Minimize"
                          >
                            <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity text-[8px] text-[#5c3e00] font-extrabold select-none leading-none pointer-events-none -mt-[3.5px]">
                              –
                            </span>
                          </button>
                          <button
                            className="h-2.5 w-2.5 rounded-full bg-[#27c93f] flex items-center justify-center transition-colors relative cursor-default outline-none"
                            title="Maximize"
                          >
                            <span className="opacity-0 group-hover/traffic:opacity-100 transition-opacity text-[7px] text-[#024d0d] font-extrabold select-none leading-none pointer-events-none mb-[0.5px]">
                              +
                            </span>
                          </button>
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-400">{t("activity.git_log", { date: selectedDay.dateStr })}</span>
                      </div>

                      <span className="text-[10px] text-zinc-600">
                        {selectedDay.count} {selectedDay.count === 1 ? t("activity.recorded_one") : t("activity.recorded_other")}
                      </span>
                    </div>

                    {/* Day Logs Body */}
                    {loadingDayCommits ? (
                      <div className="py-8 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                          <span>
                            {loadingStep === "repos" 
                              ? t("activity.fetching_repos")
                              : t("activity.scanning_logs", { loaded: loadingProgress?.loaded || 0, total: loadingProgress?.total || 0 })}
                          </span>
                        </div>
                        {loadingProgress && (
                          <div className="w-48 bg-zinc-900 border border-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-zinc-400 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                        )}
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{t("activity.concurrency_active")}</p>
                      </div>
                    ) : dayCommitsError ? (
                      <div className="py-6 text-center text-red-400 font-mono text-[11px] space-y-2">
                        <p>{t("activity.exception_detected")}</p>
                        <p className="text-zinc-500 text-[10px] max-w-md mx-auto">{dayCommitsError}</p>
                      </div>
                    ) : selectedDay.count === 0 ? (
                      <div className="py-6 text-center text-zinc-600 text-[11px] space-y-1">
                        <p>{t("activity.system_idle", { date: selectedDay.dateStr.replaceAll("-", "/") })}</p>
                        <p className="text-[10px] opacity-75">{t("activity.system_idle_desc")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {realDayCommits.map((act) => (
                          <div key={act.sha} className="flex items-start gap-3 text-[11px] border-b border-white/[0.02] pb-3 last:border-0 last:pb-0">
                            {/* Type Icon Badge */}
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white/5 border-white/10 text-zinc-300">
                              <GitCommit className="h-3 w-3" />
                            </div>

                            {/* Text and context details */}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <a 
                                  href={`https://github.com/${act.repo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-zinc-300 hover:text-white transition-colors hover:underline cursor-pointer"
                                >
                                  {act.repo}
                                </a>
                                <span className="text-[10px] text-zinc-600 font-normal">{act.time} UTC</span>
                              </div>
                              
                              <p className="text-zinc-400 font-mono leading-relaxed">{act.message}</p>
                              
                              {/* Cryptographic commit SHA token hash and author */}
                              <div className="text-[9px] text-zinc-600 flex items-center justify-between gap-1.5 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <span>{t("activity.commit_sha")}</span>
                                  <a 
                                    href={act.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-zinc-500 hover:text-zinc-300 hover:underline select-all"
                                  >
                                    {act.sha.substring(0, 10)}
                                  </a>
                                </div>
                                {act.author && (
                                  <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded px-1.5 py-0.5">
                                    <img 
                                      src={act.author.avatarUrl} 
                                      alt={act.author.login} 
                                      className="h-3.5 w-3.5 rounded-full border border-white/10"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span className="text-[10px] text-zinc-400 font-mono">{act.author.login}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Private repos banner */}
                        {privateCommitsCount > 0 && (
                          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5 text-[10px] text-zinc-500 font-mono leading-normal">
                            <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                            <span>
                              {privateCommitsCount === 1 
                                ? t("activity.private_contributions_one", { count: privateCommitsCount }) 
                                : t("activity.private_contributions_other", { count: privateCommitsCount })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </div>
    </section>
  );
}
