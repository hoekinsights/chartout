'use client'
import dynamic from 'next/dynamic'

export const PythonChartOutput = dynamic(
  () => import('./notebook').then((m) => ({ default: m.PythonChartOutput })),
  { ssr: false },
)
export const PythonStoreOutput = dynamic(
  () => import('./notebook').then((m) => ({ default: m.PythonStoreOutput })),
  { ssr: false },
)
export const BarleyChart = dynamic(
  () => import('./BarleyChart').then((m) => ({ default: m.BarleyChart })),
  { ssr: false },
)

export type { ChartLibrary } from './notebook'
export type { StorePattern } from './openStore'
