import { withBasePath } from '@/lib/basePath'

// The "chart → product" journey, ported from chartout-web's JourneySection. The
// markup/CSS there is Tailwind + web-app design tokens, which the docs (fumadocs, no
// Tailwind) can't use, so this is a docs-native re-implementation. Styling lives in
// app/globals.css under `.chartout-journey`, using fumadocs `--color-fd-*` tokens.
// Images are copied into public/images/journey/ (jpgs); withBasePath keeps them
// resolving under the production basePath.
const STEPS = [
  {
    step: '1',
    title: 'Create your chart',
    description:
      'Create charts in the notebook or web app you already use. No need to rebuild your visualization for ChartOut.',
    src: '/images/journey/chart.jpg',
    alt: 'Barley yield comparison chart rendered in a notebook with Vega-Altair',
  },
  {
    step: '2',
    title: 'Preview in the store',
    description:
      'Choose a product and preview your chart on a realistic 3D mockup. Adjust placement before you add to cart.',
    src: '/images/journey/store.jpg',
    alt: 'ChartOut store showing the barley chart printed on a ceramic mug with shopping cart',
  },
  {
    step: '3',
    title: 'Hold it in your hands',
    description:
      'Your chart is printed on demand and shipped worldwide. The same chart you previewed, now on your desk.',
    src: '/images/journey/mug.jpg',
    alt: 'Printed ceramic mug with the barley yield chart, photographed on a table outdoors',
  },
] as const

export function Journey() {
  return (
    <ol className="chartout-journey not-prose">
      {STEPS.map((item, index) => (
        <li key={item.step} className="chartout-journey__step">
          <div className="chartout-journey__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath(item.src)}
              alt={item.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="chartout-journey__image"
            />
          </div>
          <span className="chartout-journey__badge" aria-hidden="true">
            {item.step}
          </span>
          <h3 className="chartout-journey__title">{item.title}</h3>
          <p className="chartout-journey__desc">{item.description}</p>
        </li>
      ))}
    </ol>
  )
}
