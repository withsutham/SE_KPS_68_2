"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showError?: boolean; // For development: show error details
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Filter out known browser extension errors that we can safely ignore
    const isExtensionError = 
      error.message?.includes("webkit-masked-url") ||
      error.message?.includes("autofillFieldData") ||
      error.message?.includes("autoCompleteType") ||
      error.stack?.includes("webkit-masked-url");

    if (isExtensionError) {
      console.warn("Ignoring browser extension error:", error.message);
      // Don't show error UI for extension errors - just log and ignore
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    this.setState({ error, errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-medium font-mitr text-foreground">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-muted-foreground font-sans">
                ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
              </p>
            </div>

            {this.props.showError && this.state.error && (
              <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
                <p className="text-xs font-mono text-destructive break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              onClick={this.handleReset}
              className="gap-2 font-sans"
              size="lg"
            >
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
