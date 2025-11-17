import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
} from 'react'

import type {
    EventCallback,
    EventHandlers,
    PlaygroundEventEmitter,
} from '../types'
import { PlaygroundEvent } from '../types'

const EventsContext = createContext<PlaygroundEventEmitter | undefined>(
    undefined,
)

export const useEvents = () => {
    const context = useContext(EventsContext)
    if (!context) {
        throw new Error(
            'usePlaygroundEvents must be used within PlaygroundEventsProvider',
        )
    }
    return context
}

export const useSubscribeToEvent = (
    event: PlaygroundEvent,
    callback: EventCallback,
) => {
    const events = useEvents()

    useEffect(() => {
        return events.on(event, callback)
    }, [events, event, callback])
}

type PlaygroundEventsProviderProps = {
    children: ReactNode
}

export const EventsProvider = ({ children }: PlaygroundEventsProviderProps) => {
    const eventHandlers: EventHandlers = useMemo(
        () => ({
            [PlaygroundEvent.RESET_CONVERSATION]: [],
        }),
        [],
    )

    const on = useCallback(
        (event: PlaygroundEvent, callback: EventCallback) => {
            eventHandlers[event].push(callback)
            return () => {
                const index = eventHandlers[event].indexOf(callback)
                if (index > -1) {
                    eventHandlers[event].splice(index, 1)
                }
            }
        },
        [eventHandlers],
    )

    const emit = useCallback(
        (event: PlaygroundEvent) => {
            eventHandlers[event].forEach((callback) => callback())
        },
        [eventHandlers],
    )

    const events = useMemo(() => ({ on, emit }), [on, emit])

    return (
        <EventsContext.Provider value={events}>
            {children}
        </EventsContext.Provider>
    )
}
