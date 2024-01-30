import {useEffect} from 'react'

const defaultTarget = window

type GenericEventMap = HTMLElementEventMap & WindowEventMap
type GenericEventType = keyof GenericEventMap

export default function useEvent<EventType extends GenericEventType>(
    type: EventType,
    listener?:
        | null
        | undefined
        | ((this: Document, ev: GenericEventMap[EventType]) => any),
    target: null | Element | Window = defaultTarget,
    options?: boolean | AddEventListenerOptions
) {
    useEffect(() => {
        if (!listener || !target) return

        target.addEventListener(type, listener as EventListener, options)
        return () =>
            target.removeEventListener(type, listener as EventListener, options)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, listener, target, JSON.stringify(options)])
}
