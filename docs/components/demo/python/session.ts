import { createChartoutModel } from 'chartout'

type ChartoutModel = ReturnType<typeof createChartoutModel>

type Session = {
  model: ChartoutModel
  svg: SVGSVGElement | null
  listeners: Set<() => void>
}

const sessions = new Map<string, Session>()

function getSession(sessionId: string): Session {
  let session = sessions.get(sessionId)
  if (!session) {
    session = {
      model: createChartoutModel({}),
      svg: null,
      listeners: new Set(),
    }
    sessions.set(sessionId, session)
  }
  return session
}

export function setSessionSvg(sessionId: string, svg: SVGSVGElement) {
  const session = getSession(sessionId)
  session.svg = svg
  session.listeners.forEach((listener) => listener())
}

export function getSessionModel(sessionId: string): ChartoutModel {
  return getSession(sessionId).model
}

export function subscribeSessionSvg(sessionId: string, listener: () => void) {
  const session = getSession(sessionId)
  session.listeners.add(listener)
  return () => {
    session.listeners.delete(listener)
  }
}

export function getSessionSvg(sessionId: string): SVGSVGElement | null {
  return getSession(sessionId).svg
}
