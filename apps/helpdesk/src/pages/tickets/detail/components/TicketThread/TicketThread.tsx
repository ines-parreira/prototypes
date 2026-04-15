import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'
import type { TicketThreadVirtualizedListItem } from '@repo/ticket-thread'
import {
    getThreadListItemKey,
    isComposerItem,
    TicketThreadContainer,
    TicketThreadItem,
    TypingActivity,
    useTicketThread,
    ViewingActivity,
} from '@repo/ticket-thread'
import { TicketSearchParamsKeys } from '@repo/tickets/utils/routing'
import { useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import WhatsAppEditorProvider from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider'
import useCollisionDetection from 'pages/tickets/detail/components/TicketHeaderWrapper/hooks/useCollisionDetection'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { getTicket, getTicketState } from 'state/ticket/selectors'
import { editorFocused } from 'state/ui/editor/actions'

import { toActivityParticipants } from './utils/toActivityParticipants'

import css from './TicketThread.less'

type TicketThreadProps = {
    submit: (params: SubmitArgs) => any
}

const { key: showTicketEventsKey, parse: parseShowTicketEvents } =
    TicketSearchParamsKeys.showTicketEvents

export function TicketThread({ submit }: TicketThreadProps) {
    const dispatch = useAppDispatch()
    const ticketState = useAppSelector(getTicketState)
    const { accessFeaturesMapped, isStandaloneAiAgent } =
        useStandaloneAiAccess()
    const { ticketId } = useParams<{ ticketId: string }>()
    const [searchParams] = useSearchParams()
    const { agentsViewing, agentsTyping } = useCollisionDetection(
        Number(ticketId),
    )

    const ticket = useAppSelector(getTicket)
    const initialMacroFilters = useInitialMacroFilters()
    const isShopperTyping = useMemo(
        () => ticketState.getIn(['_internal', 'isShopperTyping']) as boolean,
        [ticketState],
    )
    const pendingMessages = useMemo(
        () =>
            ticketState.getIn(['_internal', 'pendingMessages'])?.toJS?.() ?? [],
        [ticketState],
    )
    const showTicketEvents = useMemo(
        () => parseShowTicketEvents(searchParams.get(showTicketEventsKey)),
        [searchParams],
    )

    const { ticketThreadItems } = useTicketThread({
        ticketId: Number(ticketId),
        showTicketEvents,
        pendingMessages,
    })

    const internalNotesOnly =
        isStandaloneAiAgent && accessFeaturesMapped.ticketsView.canRead
    const shopperName = useMemo(
        () => ticket.customer?.name ?? 'Customer',
        [ticket.customer?.name],
    )
    const customersTyping = useMemo(
        () =>
            isShopperTyping
                ? [
                      {
                          id: ticket.customer?.id ?? 'customer',
                          name: shopperName,
                      },
                  ]
                : [],
        [isShopperTyping, shopperName, ticket.customer?.id],
    )
    const activityAgentsViewing = useMemo(
        () => toActivityParticipants(agentsViewing),
        [agentsViewing],
    )
    const activityAgentsTyping = useMemo(
        () => toActivityParticipants(agentsTyping),
        [agentsTyping],
    )

    const handleBlur = useCallback(() => {
        dispatch(editorFocused(false))
    }, [dispatch])

    const handleFocus = useCallback(() => {
        dispatch(editorFocused(true))
    }, [dispatch])

    const renderThreadItem = useCallback(
        (index: number, item: TicketThreadVirtualizedListItem) => {
            const itemKey = getThreadListItemKey(
                item,
                index,
                ticketId,
                ticketThreadItems.length,
            )

            return (
                <div
                    className={css.threadItem}
                    data-item-id={itemKey}
                    role="listitem"
                >
                    {isComposerItem(item) ? (
                        <div className={css.threadComposer}>
                            <TypingActivity
                                agents={activityAgentsTyping}
                                customers={customersTyping}
                            />
                            <WhatsAppEditorProvider>
                                <Editor
                                    internalNotesOnly={internalNotesOnly}
                                    initialMacroFilters={initialMacroFilters}
                                    submit={submit}
                                    ticket={ticket}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </WhatsAppEditorProvider>
                        </div>
                    ) : (
                        <TicketThreadItem item={item} />
                    )}
                </div>
            )
        },
        [
            activityAgentsTyping,
            customersTyping,
            handleBlur,
            handleFocus,
            initialMacroFilters,
            internalNotesOnly,
            submit,
            ticket,
            ticketId,
            ticketThreadItems.length,
        ],
    )

    return (
        <div className={css.wrapper}>
            <ViewingActivity agents={activityAgentsViewing} />
            <TicketThreadContainer
                ticketId={ticketId}
                items={ticketThreadItems}
                renderThreadItem={renderThreadItem}
            />
        </div>
    )
}
