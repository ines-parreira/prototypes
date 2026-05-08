import { useEffect, useState } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { initializeMessageDraft } from 'state/newMessage/actions'
import { clearTicket } from 'state/ticket/actions'

/**
 * Sync the New Ticket Page state with Redux tied resources
 * like the Editor macros & content
 */
export function useNewTicketPageSync() {
    const dispatch = useAppDispatch()
    const [isMessageDraftInitialized, setIsMessageDraftInitialized] =
        useState(false)

    useEffect(() => {
        setIsMessageDraftInitialized(false)
        // Clear any previous ticket related Redux state
        dispatch(clearTicket())
        const timer = setTimeout(() => {
            // Initialized the Editor state (macro & content)
            dispatch(initializeMessageDraft())
            setIsMessageDraftInitialized(true)
        }, 1)
        return () => {
            clearTimeout(timer)
            dispatch(clearTicket())
        }
    }, [dispatch])

    return isMessageDraftInitialized
}
