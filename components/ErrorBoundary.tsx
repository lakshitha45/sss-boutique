"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error boundary exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-poppins">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Application Exception</span>
              <h1 className="font-serif text-3xl font-light tracking-wide">Something Went Wrong</h1>
              <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed font-light">
              An unexpected error occurred in our digital showroom. We apologize for the inconvenience. Our concierge team has been notified.
            </p>
            {this.state.error && (
              <pre className="bg-secondary border border-zinc-150 p-4 text-[10px] text-zinc-600 font-mono rounded text-left overflow-auto max-w-full max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <Button
                onClick={this.handleReset}
                size="md"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Return to Showroom
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
