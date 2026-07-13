import React, { ErrorInfo, ReactNode } from "react";
import i18next from "i18next";
import { AlertTriangle, RefreshCw, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Global ErrorBoundary Component (500 Error handler)
 * Catches unhandled JavaScript rendering exceptions inside the React tree
 * and shows a beautiful developer-centric diagnostic interface.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: (
    state: Partial<State> | ((prevState: Readonly<State>, props: Readonly<Props>) => Partial<State> | State | null),
    callback?: () => void
  ) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Global Error Caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    // Clear state and reload window to clean cache and restore memory state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev }));
  };

  public render() {
    if (this.state.hasError) {
      const { error, showDetails } = this.state;
      const t = i18next.t.bind(i18next);

      return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] text-zinc-100 p-4 font-sans select-none overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.06] bg-zinc-950/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            {/* Header Status Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  status: system_fault
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600">
                code: 500
              </span>
            </div>

            {/* Main Error Indicator */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/30 border border-red-500/20 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h1 className="text-lg font-medium text-white tracking-tight mb-2">
                {t("error.title", "Application Exception (500)")}
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                {t("error.desc", "An unexpected error occurred while executing client runtime processes. We've compiled the diagnostic traceback below.")}
              </p>
            </div>

            {/* Diagnostic Logs Panel */}
            <div className="mb-6 rounded-lg border border-white/[0.04] bg-black/40 overflow-hidden">
              <button
                onClick={this.toggleDetails}
                className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[10px] text-zinc-400 hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="h-3 w-3 text-red-500/80" />
                  <span>{t("error.details", "Technical Diagnostics (diagnostic_logs)")}</span>
                </div>
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showDetails && (
                <div className="p-4 font-mono text-[10px] text-zinc-500 leading-relaxed overflow-x-auto max-h-48 selection:bg-red-500/20 selection:text-white custom-scrollbar">
                  <span className="text-red-400/90 font-medium block mb-1">
                    {error?.name || "Error"}: {error?.message || t("error.not_specified", "No details provided.")}
                  </span>
                  {error?.stack && (
                    <pre className="whitespace-pre-wrap text-[9px] text-zinc-600 leading-normal mt-2">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-300 px-5 py-2.5 text-xs font-mono font-medium text-white tracking-tight active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t("error.reload", "// Reboot Runtime System")}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
