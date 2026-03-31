import { useMemo } from 'react'

import { TicketThreadLegacyBridgeProvider } from '@repo/ticket-thread/legacy-bridge'
import { fromJS } from 'immutable'

import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useRuleSuggestionForDemos from 'pages/tickets/detail/hooks/useRuleSuggestionForDemos'
import * as NewMessageActions from 'state/newMessage/actions'
import * as TicketActions from 'state/ticket/actions'

import { InstagramCommentPrivateReplyModal } from './InstagramCommentPrivateReplyModal'
import { useInstagramCommentActions } from './useInstagramCommentActions'

type TicketThreadLegacyBridgeProps = {
    children: React.ReactNode
}

export const TicketThreadLegacyBridge = ({
    children,
}: TicketThreadLegacyBridgeProps) => {
    const dispatch = useAppDispatch()
    const isSubmittingMessage = useAppSelector((state) =>
        Boolean(
            state.newMessage.getIn(['_internal', 'loading', 'submitMessage']),
        ),
    )
    const {
        influencedOrders,
        ticketContext: { orders: shopifyOrders, shopifyIntegrations, ticketId },
    } = useFetchInfluencedOrdersForCurrentTicket()
    const { shouldDisplayDemoSuggestion } = useRuleSuggestionForDemos(
        ticketId ?? 0,
        true,
    )
    const legacyActions = useMemo(
        () => ({
            deleteTicketPendingMessage: (message: unknown) =>
                dispatch(
                    TicketActions.deleteTicketPendingMessage(fromJS(message)),
                ),
            retrySubmitTicketMessage: (message: unknown) =>
                dispatch(
                    NewMessageActions.retrySubmitTicketMessage(fromJS(message)),
                ),
        }),
        [dispatch],
    )
    const legacyState = useMemo(
        () => ({
            newMessage: {
                isSubmittingMessage,
            },
        }),
        [isSubmittingMessage],
    )

    const {
        privateReplyData,
        handlePrivateReply,
        handlePrivateReplyToggle,
        handleHideComment,
    } = useInstagramCommentActions()

    return (
        <TicketThreadLegacyBridgeProvider
            currentTicketShoppingAssistantData={{
                influencedOrders: influencedOrders.data ?? [],
                shopifyOrders,
                shopifyIntegrations,
            }}
            currentTicketRuleSuggestionData={{ shouldDisplayDemoSuggestion }}
            onInstagramCommentPrivateReply={handlePrivateReply}
            onInstagramCommentHideComment={handleHideComment}
            legacyActions={legacyActions}
            legacyState={legacyState}
        >
            {children}
            {privateReplyData && (
                <InstagramCommentPrivateReplyModal
                    data={privateReplyData}
                    onToggle={handlePrivateReplyToggle}
                />
            )}
        </TicketThreadLegacyBridgeProvider>
    )
}
