'use client'
import { VegaEmbed } from 'react-vega'
import spec from '../../../public/barley-trail.json'

const EMBED_OPTIONS = {
  actions: false,
  renderer: 'svg' as const,
}

// Rendered output of the shared Altair `chart` used across the environment tabs.
// Spec is compiled from the Python source shown above it in environments.mdx.
export function BarleyChart() {
  return (
    <div className="not-prose chartout-vega-preview my-6">
      <VegaEmbed spec={spec as never} options={EMBED_OPTIONS} />
    </div>
  )
}
