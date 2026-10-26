import { Component, type ReactNode, useState, useEffect } from 'react';

// Lazy load InfiniteRoom to avoid loading Three.js if WebGL is not available
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
      return <FallbackBackground message={this.state.error} />;
    }
    return this.props.children;
  }
}

function FallbackBackground({ message }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      background: 'radial-gradient(ellipse at 50% 30%, #111 0%, #050505 70%)',
      overflow: 'hidden',
    }}>
      {/* Animated CSS stars fallback */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 20px 30px, #fff, transparent),
          radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.5), transparent),
          radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
          radial-gradient(1px 1px at 160px 120px, #fff, transparent),
          radial-gradient(1px 1px at 200px 60px, rgba(255,255,255,0.4), transparent)
        `,
        backgroundSize: '250px 200px',
        animation: 'twinkle 4s ease-in-out infinite alternate',
      }} />
      {message && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          color: '#333',
          fontFamily: 'monospace',
          fontSize: '10px',
        }}>
          {message}
        </div>
      )}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

export default function ThreeCanvas() {
  const [state, setState] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const [InfiniteRoom, setInfiniteRoom] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!detectWebGL()) {
      setState('fallback');
      return;
    }

    // Dynamically import to avoid loading Three.js when not needed
    import('./InfiniteRoom').then((mod) => {
      setInfiniteRoom(() => mod.default);
      setState('webgl');
    }).catch(() => {
      setState('fallback');
    });
  }, []);

  if (state === 'loading') {
    return <FallbackBackground />;
  }

  if (state === 'fallback' || !InfiniteRoom) {
    return <FallbackBackground message="WebGL not available" />;
  }

  return (
    <ErrorBoundary>
      <InfiniteRoom />
    </ErrorBoundary>
  );
}
