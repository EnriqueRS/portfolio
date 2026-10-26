import { Component, type ReactNode, useState, useEffect } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{ position: 'fixed', inset: 0, background: '#050505' }} />;
    return this.props.children;
  }
}

export default function ParticleCanvas() {
  const [Scene, setScene] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) return;
    } catch { return; }
    import('./ParticleScene').then((m) => setScene(() => m.default)).catch(() => {});
  }, []);

  if (!Scene) return <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #0f0f0f, #050505)' }} />;

  return <ErrorBoundary><Scene /></ErrorBoundary>;
}
