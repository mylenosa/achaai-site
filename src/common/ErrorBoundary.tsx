// src/components/common/ErrorBoundary.tsx
import React from 'react';

type Props = { fallback?: React.ReactNode; children: React.ReactNode };
type State = { error: any };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: any) { return { error }; }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.error) {
      return this.props.fallback ?? <div className="p-6">Falha ao carregar esta seção.</div>;
    }
    return this.props.children;
  }
}
