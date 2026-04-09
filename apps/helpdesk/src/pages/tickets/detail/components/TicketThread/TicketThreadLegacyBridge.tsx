import { useMemo } from 'react'

import { TicketThreadLegacyBridgeProvider } from '@repo/ticket-thread/legacy-bridge'
import { fromJS } from 'immutable'

import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useRuleSuggestionForDemos from 'pages/tickets/detail/hooks/useRuleSuggestionForDemos'
import * as NewMessageActions from 'state/newMessage/actions'
import * as TicketActions from 'state/ticket/actions'

import { CommentPrivateReplyModal } from './CommentPrivateReplyModal'
import { TicketThreadAiAgentDraftMessage } from './TicketThreadAiAgentDraftMessage'
import { TicketThreadAiAgentReasoning } from './TicketThreadAiAgentReasoning'
import { useFacebookCommentActions } from './useFacebookCommentActions'
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
        privateReplyData: instagramPrivateReplyData,
        handlePrivateReply: handleInstagramPrivateReply,
        handlePrivateReplyToggle: handleInstagramPrivateReplyToggle,
        handleHideComment: handleInstagramHideComment,
    } = useInstagramCommentActions()

    const {
        privateReplyData: facebookPrivateReplyData,
        handlePrivateReply: handleFacebookPrivateReply,
        handlePrivateReplyToggle: handleFacebookPrivateReplyToggle,
        handleHideComment: handleFacebookHideComment,
        handleLike: handleFacebookLike,
    } = useFacebookCommentActions()

    return (
        <TicketThreadLegacyBridgeProvider
            currentTicketShoppingAssistantData={{
                influencedOrders: influencedOrders.data ?? [],
                shopifyOrders,
                shopifyIntegrations,
            }}
            currentTicketRuleSuggestionData={{ shouldDisplayDemoSuggestion }}
            onInstagramCommentPrivateReply={handleInstagramPrivateReply}
            onInstagramCommentHideComment={handleInstagramHideComment}
            onFacebookCommentPrivateReply={handleFacebookPrivateReply}
            onFacebookCommentHideComment={handleFacebookHideComment}
            onFacebookCommentLike={handleFacebookLike}
            legacyActions={legacyActions}
            legacyState={legacyState}
            renderAiAgentDraftMessage={(params) => (
                <TicketThreadAiAgentDraftMessage {...params} />
            )}
            renderAiAgentReasoning={(params) => (
                <TicketThreadAiAgentReasoning {...params} />
            )}
        >
            {children}
            {instagramPrivateReplyData && (
                <CommentPrivateReplyModal
                    data={instagramPrivateReplyData}
                    isFacebookComment={false}
                    onToggle={handleInstagramPrivateReplyToggle}
                />
            )}
            {facebookPrivateReplyData && (
                <CommentPrivateReplyModal
                    data={facebookPrivateReplyData}
                    isFacebookComment={true}
                    onToggle={handleFacebookPrivateReplyToggle}
                />
            )}
        </TicketThreadLegacyBridgeProvider>
    )
}
