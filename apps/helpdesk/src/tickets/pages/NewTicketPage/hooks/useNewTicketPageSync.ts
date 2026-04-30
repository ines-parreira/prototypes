import { useEffect } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { initializeMessageDraft } from 'state/newMessage/actions'
import { clearTicket } from 'state/ticket/actions'

/**
 * Sync the New Ticket Page state with Redux tied resources
 * like the Editor macros & content
 */
export function useNewTicketPageSync() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        // Clear any previous ticket related Redux state
        dispatch(clearTicket())
        const timer = setTimeout(() => {
            // Initialized the Editor state (macro & content)
            dispatch(initializeMessageDraft())
        }, 1)
        return () => {
            clearTimeout(timer)
            dispatch(clearTicket())
        }
    }, [dispatch])
}
