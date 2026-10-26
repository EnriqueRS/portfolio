import { Component, type ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 30%, #111 0%, #050505 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}>
          {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

export default function GravityCanvas() {
  const [state, setState] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const [GravityScene, setGravityScene] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!detectWebGL()) {
      setState('fallback');
      return;
    }

    import('./GravityScene').then((mod) => {
      setGravityScene(() => mod.default);
      setState('webgl');
    }).catch(() => {
      setState('fallback');
    });
  }, []);

  if (state === 'loading' || state === 'fallback' || !GravityScene) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 30%, #0f0f0f 0%, #050505 70%)',
      }} />
    );
  }

  return (
    <ErrorBoundary>
      <GravityScene />
    </ErrorBoundary>
  );
}
