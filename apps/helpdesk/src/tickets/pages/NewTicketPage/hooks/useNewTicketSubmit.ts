import { useCallback, useMemo } from 'react'

import { localForageManager } from '@repo/browser-storage'
import type { TicketFieldsState } from '@repo/tickets'
import {
    getMacroTicketFieldValues,
    MacroActionName,
    useTicketFieldsStore,
} from '@repo/tickets'
import { CreateTicketSearchParamsKeys } from '@repo/tickets/utils/routing'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import type {
    TicketPriority,
    TicketTag,
    TicketTeam,
    TicketUser,
} from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { DRAFT_TICKET_STORE } from 'hooks/useTicketDraft'
import type { Ticket as TicketModel } from 'models/ticket/types'
import { updateMessageText } from 'pages/tickets/detail/components/ReplyArea/TicketReplyEditor'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { submitTicket } from 'state/newMessage/actions'
import { canSend as getCanSend } from 'state/newMessage/selectors'
import { restoreTicketDraft } from 'state/ticket/actions'

type UseNewTicketSubmitArgs = {
    subject: string
    priority: TicketPriority | undefined
    assigneeUser: TicketUser | null
    assigneeTeam: TicketTeam | null
    tags: TicketTag[]
    customer: TicketModel['customer'] | null
    temporaryId: string | null
}

function mergeCustomFieldsWithMacroValues(
    customFields: TicketFieldsState,
    appliedMacro: Map<any, any> | null | undefined,
): TicketFieldsState {
    const macroTicketFieldValues = getMacroTicketFieldValues(
        appliedMacro?.toJS(),
    )

    return Object.entries(macroTicketFieldValues).reduce<TicketFieldsState>(
        (fields, [fieldId, value]) => ({
            ...fields,
            [fieldId]: {
                // Macros can set conditionally visible fields that are not in the ticket fields store yet.
                // The create-ticket API still requires each submitted custom field value to carry its id.
                ...fields[fieldId],
                id: Number(fieldId),
                value,
            },
        }),
        customFields,
    )
}

const { key: previousURLKey, parse: parsePreviousURL } =
    CreateTicketSearchParamsKeys.previousURL

function getNonEmptyMap(value: Map<any, any> | undefined) {
    return value && !value.isEmpty() ? value : undefined
}

function doesReceiverBelongToCustomer(
    receiver: Map<any, any> | undefined,
    customer: Map<any, any> | undefined,
) {
    if (!receiver || !customer) {
        return false
    }

    const receiverId = receiver.get('id')
    const customerId = customer.get('id')

    if (receiverId != null && customerId != null) {
        return Number(receiverId) === Number(customerId)
    }

    const receiverAddress = receiver.get('address')

    if (!receiverAddress) {
        return false
    }

    if (receiverAddress === customer.get('email')) {
        return true
    }

    const channels = customer.get('channels') as List<Map<any, any>> | undefined

    return (
        channels?.some(
            (channel) => channel?.get('address') === receiverAddress,
        ) ?? false
    )
}

function getSubmittedTicketCustomer(
    newMessage: Map<any, any>,
    submittedTicket: Map<any, any>,
) {
    const selectedCustomer = getNonEmptyMap(
        submittedTicket.get('customer') as Map<any, any> | undefined,
    )
    const legacyReceiver = getNonEmptyMap(
        newMessage.getIn(['newMessage', 'receiver']) as
            | Map<any, any>
            | undefined,
    )
    const firstSourceRecipient = getNonEmptyMap(
        newMessage.getIn(['newMessage', 'source', 'to', 0]) as
            | Map<any, any>
            | undefined,
    )
    const receiver = legacyReceiver ?? firstSourceRecipient

    if (!receiver) {
        return selectedCustomer
    }

    if (doesReceiverBelongToCustomer(receiver, selectedCustomer)) {
        return selectedCustomer
    }

    return receiver
}

export function useNewTicketSubmit({
    subject,
    priority,
    assigneeUser,
    assigneeTeam,
    tags,
    customer,
    temporaryId,
}: UseNewTicketSubmitArgs) {
    const dispatch = useAppDispatch()
    const canSendMessage = useAppSelector(getCanSend)
    const fields = useTicketFieldsStore((state) => state.fields)
    const { search } = useLocation()
    const previousURL = useMemo(
        () => parsePreviousURL(new URLSearchParams(search).get(previousURLKey)),
        [search],
    )

    const submit = useCallback(
        async ({ status, resetMessage = true }: SubmitArgs) => {
            const state = dispatch((_, getState) => getState())
            const newMessage = state.newMessage
            const closedTicketRedirectPath =
                status === TicketStatus.Closed ? previousURL : null

            if (newMessage.getIn(['_internal', 'loading', 'submitMessage'])) {
                return
            }

            if (!canSendMessage) {
                return
            }

            updateMessageText.flush()

            const appliedMacro = state.ticket.getIn([
                'state',
                'appliedMacro',
            ]) as Map<any, any> | null | undefined
            const customFields = mergeCustomFieldsWithMacroValues(
                fields,
                appliedMacro,
            )

            dispatch(
                restoreTicketDraft({
                    assignee_team: assigneeTeam as TicketModel['assignee_team'],
                    assignee_user: assigneeUser as TicketModel['assignee_user'],
                    custom_fields: customFields as TicketModel['custom_fields'],
                    customer,
                    subject,
                    tags: tags as TicketModel['tags'],
                }),
            )

            const freshState = dispatch((_, getState) => getState())
            const ticket = freshState.ticket
            const currentUser = freshState.currentUser

            let submittedTicket = ticket.setIn(['newMessage', 'sender'], {
                id: currentUser.get('id'),
            })

            const sourceType = newMessage.getIn([
                'newMessage',
                'source',
                'type',
            ])
            const hasInternalNoteAction = (
                ticket.getIn(
                    ['state', 'appliedMacro', 'actions'],
                    fromJS([]),
                ) as List<Map<any, any>>
            ).some(
                (action) =>
                    action?.get('name') === MacroActionName.AddInternalNote,
            )

            if (sourceType !== 'internal-note' && !hasInternalNoteAction) {
                submittedTicket = submittedTicket.set(
                    'customer',
                    getSubmittedTicketCustomer(newMessage, submittedTicket),
                )
            }

            if (priority !== undefined) {
                submittedTicket = submittedTicket.set('priority', priority)
            }

            const { error } = ((await dispatch(
                submitTicket(
                    submittedTicket,
                    status,
                    ticket.getIn(['state', 'appliedMacro', 'actions']),
                    currentUser,
                    resetMessage,
                    temporaryId,
                    closedTicketRedirectPath ?? undefined,
                ),
            )) || {}) as { error?: unknown }

            if (!error) {
                localForageManager.clearTable(DRAFT_TICKET_STORE)
            }
        },
        [
            dispatch,
            canSendMessage,
            assigneeTeam,
            assigneeUser,
            customer,
            subject,
            tags,
            priority,
            temporaryId,
            fields,
            previousURL,
        ],
    )

    return { submit }
}
