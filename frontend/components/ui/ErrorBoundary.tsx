"use client";
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
          <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-1">Something went wrong</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              An unexpected error occurred. Please refresh and try again.
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-all"
          >
            <RefreshCw size={16} />
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

