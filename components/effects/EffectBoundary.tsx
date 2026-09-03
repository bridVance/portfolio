"use client";

import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };
type State = { failed: boolean };

export class EffectBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    if (process.env.NODE_ENV !== "production") console.error("[effect]", err);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
