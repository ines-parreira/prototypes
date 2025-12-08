import { useEffect } from 'react'

import {
    OPEN_DELETE_DOCUMENT_MODAL,
    OPEN_DELETE_URL_MODAL,
    OPEN_SYNC_URL_MODAL,
    OPEN_SYNC_WEBSITE_MODAL,
} from 'pages/aiAgent/KnowledgeHub/constants'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

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

export const openUrlModal = (selectedFolder: GroupedKnowledgeItem) => {
    dispatchDocumentEvent(OPEN_SYNC_URL_MODAL, selectedFolder)
}

export const openSyncStoreWebsiteModal = () => {
    dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)
}

export const openDeleteUrlModal = (data: GroupedKnowledgeItem) => {
    dispatchDocumentEvent(OPEN_DELETE_URL_MODAL, data)
}

export const openDeleteDocumentModal = (data: GroupedKnowledgeItem) => {
    dispatchDocumentEvent(OPEN_DELETE_DOCUMENT_MODAL, data)
}
