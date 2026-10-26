import { Component, type ReactNode, useState, useEffect } from 'react';
import Terminal from './Terminal';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a' }} />;
    return this.props.children;
  }
}

export default function TerminalCanvas() {
  const [Shader, setShader] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) {
        setShader(null);
        return;
      }
    } catch { return; }
    import('./ShaderBackground').then((m) => setShader(() => m.default)).catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      {Shader && <Shader />}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <Terminal />
      </div>
    </ErrorBoundary>
  );
}
