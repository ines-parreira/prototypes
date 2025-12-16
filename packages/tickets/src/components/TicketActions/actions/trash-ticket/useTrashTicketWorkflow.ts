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
    const {
        isOpen: isTrashTicketModalOpen,
        toggle: handleTrashTicketModalToggle,
    } = useToggle(false)

    const handleTrashTicketMenuClick = useCallback(() => {
        if (isTrashed) {
            trashTicket(ticketId, { trashed_datetime: null })
        } else if (!isTrashed && !isTrashTicketModalOpen) {
            handleTrashTicketModalToggle()
        }
    }, [
        isTrashed,
        isTrashTicketModalOpen,
        handleTrashTicketModalToggle,
        trashTicket,
        ticketId,
    ])

    return {
        canTrashTicket,
        handleTrashTicketMenuClick,
        isTrashTicketModalOpen,
        handleTrashTicketModalToggle,
    }
}
