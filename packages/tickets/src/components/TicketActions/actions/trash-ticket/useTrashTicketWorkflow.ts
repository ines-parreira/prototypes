import { useCallback, useMemo } from 'react'

import { useToggle } from '@repo/hooks'
import { hasRole, UserRole } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { useTrashTicket } from './useTrashTicket'

type UseTrashTicketWorkflowParams = {
    isTrashed: boolean
    ticketId: number
}
export function useTrashTicketWorkflow({
    isTrashed,
    ticketId,
}: UseTrashTicketWorkflowParams) {
    const { trashTicket } = useTrashTicket(ticketId)
    const { data: currentUser } = useGetCurrentUser()
    const canTrashTicket = useMemo(
        () => currentUser && hasRole(currentUser.data, UserRole.Agent),
        [currentUser],
    )
    const { isOpen, toggle } = useToggle(false)

    const handleTrashTicketMenuClick = useCallback(async () => {
        if (!isTrashed && !isOpen) {
            void toggle()
        } else if (isTrashed) {
            await trashTicket(ticketId, {
                trashed_datetime: null,
            })
        }
    }, [isTrashed, isOpen, toggle, trashTicket, ticketId])

    return {
        canTrashTicket,
        handleTrashTicketMenuClick,
        isOpen,
        toggle,
    }
}
