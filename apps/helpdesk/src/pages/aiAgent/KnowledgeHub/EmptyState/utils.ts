import { useEffect } from 'react'

/**
 * Custom hook to listen to custom document events
 *
 * @param eventName - The name of the custom event to listen for
 * @param handler - The event handler function
 *
 * @important The handler function should be memoized using useCallback to prevent
 * unnecessary re-renders and potential memory leaks.
 *
 * @example
 * ```tsx
 * const handleModalOpen = useCallback(() => {
 *   setIsOpen(prev => !prev)
 * }, [])
 *
 * useListenToDocumentEvent(OPEN_MODAL_EVENT, handleModalOpen)
 * ```
 */
export const useListenToDocumentEvent = (
    eventName: string,
    handler: (event?: Event) => void,
) => {
    useEffect(() => {
        window.addEventListener(eventName, handler)
        return () => {
            window.removeEventListener(eventName, handler)
        }
    }, [eventName, handler])
}

export const dispatchDocumentEvent = (eventName: string, detail?: any) => {
    const event = new CustomEvent(eventName, { detail })
    window.dispatchEvent(event)
}
