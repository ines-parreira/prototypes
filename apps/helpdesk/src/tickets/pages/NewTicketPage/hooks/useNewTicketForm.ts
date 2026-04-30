import { useCallback, useEffect, useState } from 'react'

import type {
    Team,
    TicketPriority,
    TicketTag,
    TicketTeam,
    TicketUser,
    User,
} from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import type { Ticket } from 'models/ticket/types'
import { findAndSetCustomer } from 'state/ticket/actions'
import type { Receiver } from 'state/ticket/utils'
import { useNewTicketDraft } from 'tickets/pages/NewTicketPage/hooks/useNewTicketDraft'
import { useNewTicketSubmit } from 'tickets/pages/NewTicketPage/hooks/useNewTicketSubmit'

type NewTicketState = {
    subject: string
    priority: TicketPriority | undefined
    assigneeUser: TicketUser | null
    assigneeTeam: TicketTeam | null
    tags: TicketTag[]
    customer: Ticket['customer'] | null
}

export function useNewTicketPageForm() {
    const dispatch = useAppDispatch()
    const [ticketState, setTicketState] = useState<NewTicketState>({
        subject: '',
        priority: undefined,
        assigneeUser: null,
        assigneeTeam: null,
        tags: [],
        customer: null,
    })

    const { temporaryId, restoredLocalState } = useNewTicketDraft({
        subject: ticketState.subject,
        priority: ticketState.priority,
        assigneeUser: ticketState.assigneeUser,
        assigneeTeam: ticketState.assigneeTeam,
        tags: ticketState.tags,
        customer: ticketState.customer,
    })

    useEffect(() => {
        if (restoredLocalState) {
            setTicketState((prev) => ({
                ...prev,
                subject: restoredLocalState.subject,
                priority: restoredLocalState.priority,
                assigneeUser: restoredLocalState.assigneeUser,
                assigneeTeam: restoredLocalState.assigneeTeam,
                tags: restoredLocalState.tags,
            }))
        }
    }, [restoredLocalState])

    const { submit } = useNewTicketSubmit({
        subject: ticketState.subject,
        priority: ticketState.priority,
        assigneeUser: ticketState.assigneeUser,
        assigneeTeam: ticketState.assigneeTeam,
        tags: ticketState.tags,
        customer: ticketState.customer,
        temporaryId,
    })

    const handleSubjectChange = (subject: string) => {
        setTicketState((prev) => ({ ...prev, subject }))
    }

    const handlePriorityChange = (priority: TicketPriority) => {
        setTicketState((prev) => ({ ...prev, priority }))
    }

    const handleUserChange = (user: User | null) => {
        setTicketState((prev) => ({
            ...prev,
            assigneeUser: user as TicketUser | null,
        }))
    }

    const handleTeamChange = (team: Team | null) => {
        setTicketState((prev) => ({
            ...prev,
            assigneeTeam: team as TicketTeam | null,
        }))
    }

    const handleTagsChange = useCallback((tags: TicketTag[]) => {
        setTicketState((prev) => ({ ...prev, tags }))
    }, [])

    const handleRecipientsChange = useCallback(
        (prop: string, recipients: Receiver[]) => {
            if (
                prop === 'to' &&
                recipients.length === 1 &&
                recipients[0].id !== undefined
            ) {
                dispatch(findAndSetCustomer(recipients[0].id!))
            } else if (prop === 'to' && recipients.length === 0) {
                setTicketState((prev) => ({ ...prev, customer: null }))
            }
        },
        [dispatch],
    )

    return {
        ticketState,
        handleSubjectChange,
        handlePriorityChange,
        handleUserChange,
        handleTeamChange,
        handleTagsChange,
        handleRecipientsChange,
        submit,
        temporaryId,
    }
}
