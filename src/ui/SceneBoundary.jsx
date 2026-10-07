import { Component } from 'react'

/**
 * Keeps a WebGL failure from taking the page down with it. On error the 2D
 * layers render over a flat background instead of the room.
 */
export class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[archive] 3D scene failed, falling back to flat view:', error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
