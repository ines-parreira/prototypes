import { createStore } from 'zustand'

export type ViewEvent = {
    direction: 'inbound' | 'outbound'
    type: string
    viewIds: number[]
    timestamp: number
}

export const viewEventLogStore = createStore<ViewEventLogState>()(() => ({
    events: [],
}))

export function logViewEvent(
    direction: ViewEvent['direction'],
    type: string,
    viewIds: number[],
): void {
    viewEventLogStore.setState((state) => ({
        events: [
            ...state.events,
            { direction, type, viewIds, timestamp: Date.now() },
        ],
    }))
}

type ViewEventLogState = {
    events: ViewEvent[]
}
