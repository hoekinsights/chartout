'use client'
import { useEffect, useState } from 'react'
import { ChartoutWidget } from 'chartout/react'
import {
  AltairChartRenderer,
  MatplotlibChartRenderer,
  VgplotChartRenderer,
} from './chartRenderers'
import { ChartCell, StoreCell } from './NotebookOutput'
import { openStorePattern, type StorePattern } from './openStore'
import { getSessionModel, getSessionSvg, subscribeSessionSvg } from './session'

export type ChartLibrary = 'altair' | 'vgplot' | 'matplotlib'

type PythonChartOutputProps = {
  library: ChartLibrary
  sessionId: string
}

type PythonStoreOutputProps = {
  sessionId: string
  pattern: StorePattern
}

function useSessionSvg(sessionId: string) {
  const [svg, setSvg] = useState<SVGSVGElement | null>(() => getSessionSvg(sessionId))

  useEffect(() => subscribeSessionSvg(sessionId, () => setSvg(getSessionSvg(sessionId))), [sessionId])

  return svg
}

export function PythonChartOutput({ library, sessionId }: PythonChartOutputProps) {
  return (
    <ChartCell>
      {library === 'altair' && <AltairChartRenderer sessionId={sessionId} />}
      {library === 'vgplot' && <VgplotChartRenderer sessionId={sessionId} />}
      {library === 'matplotlib' && <MatplotlibChartRenderer sessionId={sessionId} />}
    </ChartCell>
  )
}

export function PythonStoreOutput({ sessionId, pattern }: PythonStoreOutputProps) {
  const svg = useSessionSvg(sessionId)
  const model = getSessionModel(sessionId)

  useEffect(() => {
    if (!svg) return
    void openStorePattern(sessionId, pattern, svg)
  }, [sessionId, pattern, svg])

  return (
    <StoreCell>
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </StoreCell>
  )
}
