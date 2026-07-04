import { createChartoutModel } from 'chartout'

type ChartoutModel = ReturnType<typeof createChartoutModel>

type Session = {
  model: ChartoutModel
  svgs: SVGSVGElement[]
  listeners: Set<() => void>
}

const sessions = new Map<string, Session>()

function getSession(sessionId: string): Session {
  let session = sessions.get(sessionId)
  if (!session) {
    session = {
      model: createChartoutModel({}),
      svgs: [],
      listeners: new Set(),
    }
    sessions.set(sessionId, session)
  }
  return session
}

export function setSessionSvgs(sessionId: string, svgs: SVGSVGElement[]) {
  const session = getSession(sessionId)
  session.svgs = svgs
  session.listeners.forEach((listener) => listener())
}

export function getSessionModel(sessionId: string): ChartoutModel {
  return getSession(sessionId).model
}

export function subscribeSessionSvgs(sessionId: string, listener: () => void) {
  const session = getSession(sessionId)
  session.listeners.add(listener)
  return () => {
    session.listeners.delete(listener)
  }
}

export function getSessionSvgs(sessionId: string): SVGSVGElement[] {
  return getSession(sessionId).svgs
}
