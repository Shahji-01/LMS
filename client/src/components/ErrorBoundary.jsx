import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary — catches render-time errors and shows a graceful fallback.
 * If Sentry is configured (VITE_SENTRY_DSN), errors are automatically
 * captured via the @sentry/react Sentry.init() called in main.jsx.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Report to console in dev; Sentry captures automatically if initialized
        console.error("[ErrorBoundary] Caught error:", error, info.componentStack);

        // Optionally call Sentry manually if not using Sentry.ErrorBoundary wrapper
        try {
            if (window.__SENTRY__) {
                import("@sentry/react").then(({ captureException }) =>
                    captureException(error, { extra: info })
                );
            }
        } catch {
            // Sentry not initialized — silently ignore
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-10 max-w-md w-full text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-900/30 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={28} className="text-red-400" />
                        </div>

                        <h1 className="text-white text-xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-gray-400 text-sm mb-6">
                            An unexpected error occurred. Our team has been notified.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <pre className="bg-gray-800 rounded-lg p-3 text-left text-xs text-red-300 mb-6 overflow-auto max-h-32">
                                {this.state.error.toString()}
                            </pre>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <RefreshCw size={14} /> Try again
                            </button>
                            <button
                                onClick={() => (window.location.href = "/")}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                            >
                                Go home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
