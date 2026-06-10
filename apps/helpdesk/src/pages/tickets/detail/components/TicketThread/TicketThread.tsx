import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'
import type { TicketThreadItemType } from '@repo/ticket-thread'
import {
    getThreadItemKey,
    TicketThreadContainer,
    TicketThreadItem,
    TypingActivity,
    useTicketThread,
    ViewingActivity,
} from '@repo/ticket-thread'
import { TicketSearchParamsKeys } from '@repo/tickets/utils/routing'
import { useParams } from 'react-router-dom'
import { useCallbackRef } from '@gorgias/toolkit-react'

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

import { HandoverSummarizeButton } from './HandoverSummarizeButton'
import { TicketThreadSummarySection } from './TicketThreadSummarySection'
import { useTicketThreadSummary } from './useTicketThreadSummary'
import { toActivityParticipants } from './utils/toActivityParticipants'

import { TicketThreadEditorSkeleton } from './TicketThreadEditorSkeleton'
import css from './TicketThread.less'

type TicketThreadProps = {
    submit: (params: SubmitArgs) => any
    isLoading?: boolean
}

const { key: showTicketEventsKey, parse: parseShowTicketEvents } =
    TicketSearchParamsKeys.showTicketEvents

export function TicketThread({ submit, isLoading = false }: TicketThreadProps) {
    const dispatch = useAppDispatch()
    const [threadContainerElement, setThreadContainerElement] = useCallbackRef()
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

    const { ticketThreadItems, isMessagesLoading } = useTicketThread({
        ticketId: Number(ticketId),
        showTicketEvents,
        pendingMessages,
    })

    const {
        summary,
        isLoading: isSummaryLoading,
        errorMessage: summaryErrorMessage,
        isRetriable: isSummaryRetriable,
        requestSummary,
        showButton,
        showSummaryBubble,
        summarizeCount,
    } = useTicketThreadSummary({
        ticketId: Number(ticketId),
        initialSummary: ticketState.get('summary')?.toJS(),
        ticketThreadItems,
        isMessagesLoading,
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
        (index: number, item: TicketThreadItemType) => (
            <div
                data-item-id={getThreadItemKey(item, index, ticketId)}
                role="listitem"
            >
                <TicketThreadItem item={item} />
            </div>
        ),
        [ticketId],
    )

    return (
        <div className={css.threadContainer} ref={setThreadContainerElement}>
            <ViewingActivity agents={activityAgentsViewing} />
            <div className={css.threadMessagesContainer}>
                <TicketThreadContainer
                    containerElement={threadContainerElement}
                    ticketId={ticketId}
                    items={ticketThreadItems}
                    renderThreadItem={renderThreadItem}
                />
            </div>
            {showSummaryBubble && (
                <TicketThreadSummarySection
                    summary={summary}
                    isLoading={isSummaryLoading}
                    errorMessage={summaryErrorMessage}
                    isRetriable={isSummaryRetriable}
                    requestSummary={requestSummary}
                />
            )}
            {showButton && (
                <HandoverSummarizeButton
                    messageCount={summarizeCount}
                    isLoading={isSummaryLoading}
                    onSummarize={requestSummary}
                />
            )}
            <div className={css.threadComposer}>
                <TypingActivity
                    agents={activityAgentsTyping}
                    customers={customersTyping}
                />
                {isLoading ? (
                    <TicketThreadEditorSkeleton />
                ) : (
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
                )}
            </div>
        </div>
    )
}
