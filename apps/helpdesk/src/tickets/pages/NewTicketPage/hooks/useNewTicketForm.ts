import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useGetCustomer } from '@repo/customer/hooks'
import { useSearchParams } from '@repo/routing'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'
import { z } from 'zod'

import { toast } from '@gorgias/axiom'
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

type UseNewTicketPageFormArgs = {
    isMessageDraftInitialized?: boolean
}

type NewTicketPageLocationState = {
    receiver?: Receiver
}

const parseCustomerId = (value: string | null) => {
    if (value === null) {
        return null
    }

    const result = z.coerce.number().int().positive().safeParse(value)

    if (!result.success) {
        return null
    }

    return result.data
}

const NewTicketSearchParamsKeys = {
    customer: {
        key: 'customer',
        parse: parseCustomerId,
    },
    customerId: {
        key: 'customer_id',
        parse: parseCustomerId,
    },
} as const

function getCustomerReceiverAddress(customer: TicketCustomer) {
    return (
        customer.email ??
        customer.channels?.find((channel) => channel.preferred)?.address ??
        customer.channels?.find((channel) => channel.address)?.address ??
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

function getLocationStateReceiver(receiver: Receiver | undefined) {
    if (!receiver?.address) {
        return null
    }

    return receiver
}

export function useNewTicketPageForm({
    isMessageDraftInitialized = true,
}: UseNewTicketPageFormArgs = {}) {
    const dispatch = useAppDispatch()
    const { state } = useLocation<NewTicketPageLocationState | undefined>()
    const locationStateReceiver = useMemo(
        () => getLocationStateReceiver(state?.receiver),
        [state?.receiver],
    )
    const [searchParams] = useSearchParams()
    const urlCustomerId = useMemo(
        () =>
            NewTicketSearchParamsKeys.customer.parse(
                searchParams.get(NewTicketSearchParamsKeys.customer.key),
            ) ??
            NewTicketSearchParamsKeys.customerId.parse(
                searchParams.get(NewTicketSearchParamsKeys.customerId.key),
            ),
        [searchParams],
    )
    const { data: urlCustomerResponse } = useGetCustomer(
        urlCustomerId ?? 0,
        undefined,
        {
            query: {
                enabled: urlCustomerId != null,
            },
        },
    )
    const appliedUrlCustomerIdRef = useRef<number | null>(null)
    const hasUserSelectedCustomerRef = useRef(false)
    const [ticketState, setTicketState] = useState<NewTicketState>({
        subject: '',
        priority: undefined,
        assigneeUser: null,
        assigneeTeam: null,
        tags: [],
        customer: null,
    })

    const { temporaryId, restoredLocalState, shouldAutoFocusSubject } =
        useNewTicketDraft({
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

    const applyCustomer = useCallback(
        (customer: TicketCustomer, preferredReceiver?: Receiver | null) => {
            const receiver = preferredReceiver ?? getCustomerReceiver(customer)

            dispatch(setCustomer(fromJS(customer)))
            if (receiver) {
                dispatch(setReceivers({ to: [receiver] }, false))
            }
            setTicketState((prev) => ({
                ...prev,
                customer: customer as unknown as Ticket['customer'],
            }))
        },
        [dispatch],
    )

    useEffect(() => {
        const urlCustomer = urlCustomerResponse?.data as
            | TicketCustomer
            | undefined

        if (
            !isMessageDraftInitialized ||
            urlCustomerId == null ||
            !urlCustomer ||
            hasUserSelectedCustomerRef.current ||
            appliedUrlCustomerIdRef.current === urlCustomerId
        ) {
            return
        }

        applyCustomer(urlCustomer, locationStateReceiver)
        appliedUrlCustomerIdRef.current = urlCustomerId
    }, [
        applyCustomer,
        isMessageDraftInitialized,
        locationStateReceiver,
        urlCustomerId,
        urlCustomerResponse,
    ])

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
                    hasUserSelectedCustomerRef.current = true
                    dispatch(setCustomer(fromJS(data)))
                    setTicketState((prev) => ({
                        ...prev,
                        customer: data as unknown as Ticket['customer'],
                    }))
                } catch {
                    toast.error('Failed to fetch customer')
                }
            } else if (prop === 'to' && recipients.length === 0) {
                hasUserSelectedCustomerRef.current = true
                dispatch(setCustomer(fromJS(null)))
                setTicketState((prev) => ({ ...prev, customer: null }))
            }
        },
        [dispatch],
    )

    const handleCustomerChange = useCallback(
        async (customer: TicketCustomer) => {
            hasUserSelectedCustomerRef.current = true

            if (!customer.id) {
                applyCustomer(customer)
                return
            }

            try {
                const { data } = await getCustomer(customer.id)
                applyCustomer(data as TicketCustomer)
            } catch {
                toast.error('Failed to fetch customer')
                applyCustomer(customer)
            }
        },
        [applyCustomer],
    )

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
        shouldAutoFocusSubject,
    }
}
