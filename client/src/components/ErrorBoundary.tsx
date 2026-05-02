"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-phase errors so a single broken widget doesn't kill the whole
 * page. Wrap any subtree that makes API calls or renders dynamic data.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return { hasError: true, message };
  }

  handleReset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-gray-500 mb-4">
              Something went wrong loading this section.
            </p>
            <button
              onClick={this.handleReset}
              className="btn-primary text-sm px-6"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
