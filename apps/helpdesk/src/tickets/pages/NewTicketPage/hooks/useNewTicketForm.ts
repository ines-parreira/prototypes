import { useCallback, useEffect, useState } from 'react'

import { fromJS } from 'immutable'

import { getCustomer } from '@gorgias/helpdesk-client'
import type {
    Team,
    TicketCustomer,
    TicketPriority,
    TicketTag,
    TicketTeam,
    TicketUser,
    User,
} from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import type { Ticket } from 'models/ticket/types'
import { setReceivers } from 'state/newMessage/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { setCustomer } from 'state/ticket/actions'
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

function getCustomerReceiverAddress(customer: TicketCustomer) {
    return (
        customer.email ??
        customer.channels.find((channel) => channel.preferred)?.address ??
        customer.channels.find((channel) => channel.address)?.address ??
        null
    )
}

function getCustomerReceiver(customer: TicketCustomer): Receiver | null {
    const address = getCustomerReceiverAddress(customer)

    if (!address) {
        return null
    }

    return {
        id: customer.id,
        name: customer.name ?? '',
        address,
    }
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
                customer: restoredLocalState.customer,
            }))
        }
    }, [restoredLocalState, setTicketState])

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
        async (prop: string, recipients: Receiver[]) => {
            const hasRecipient =
                recipients.length === 1 && recipients[0].id !== undefined
            if (prop === 'to' && hasRecipient) {
                try {
                    const { data } = await getCustomer(
                        recipients[0].id as number,
                    )
                    dispatch(setCustomer(fromJS(data)))
                    setTicketState((prev) => ({
                        ...prev,
                        customer: data as unknown as Ticket['customer'],
                    }))
                } catch {
                    dispatch(
                        notify({
                            message: 'Failed to fetch customer',
                            status: NotificationStatus.Error,
                        }),
                    )
                }
            } else if (prop === 'to' && recipients.length === 0) {
                dispatch(setCustomer(fromJS(null)))
                setTicketState((prev) => ({ ...prev, customer: null }))
            }
        },
        [dispatch],
    )

    const handleCustomerChange = (customer: TicketCustomer) => {
        const receiver = getCustomerReceiver(customer)

        dispatch(setCustomer(fromJS(customer)))
        if (receiver) {
            dispatch(setReceivers({ to: [receiver] }, false))
        }
        setTicketState((prev) => ({
            ...prev,
            customer: customer as unknown as Ticket['customer'],
        }))
    }

    return {
        ticketState,
        handleSubjectChange,
        handlePriorityChange,
        handleUserChange,
        handleTeamChange,
        handleTagsChange,
        handleRecipientsChange,
        handleCustomerChange,
        submit,
        temporaryId,
    }
}
