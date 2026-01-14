import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);

    // You can also send this to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4 font-semibold">Ein unerwarteter Fehler ist aufgetreten</h2>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Entschuldigung, etwas ist schiefgelaufen. Bitte laden Sie die Seite neu oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="p-4 w-full rounded bg-muted overflow-auto mb-6">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Technische Details (nur in Entwicklung sichtbar)
                </summary>
                <pre className="text-xs text-muted-foreground whitespace-break-spaces mt-2">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
