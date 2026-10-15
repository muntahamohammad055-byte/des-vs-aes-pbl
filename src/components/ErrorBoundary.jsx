import React from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-[#0b1329] border border-rose-500/40 rounded-2xl p-8 shadow-2xl shadow-rose-950/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Application Runtime Intercept
                </h1>
                <p className="text-xs text-rose-300 font-mono">
                  PBL Safety Boundary Activated
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4" />
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error'}
              </div>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto max-h-40 p-2 bg-slate-950/80 rounded border border-slate-900">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected component exception occurred. You can safely reload the cryptographic engine to resume experiments.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm font-mono transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
