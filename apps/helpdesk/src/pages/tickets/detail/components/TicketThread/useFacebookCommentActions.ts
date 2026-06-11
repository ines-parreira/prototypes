import { useState } from 'react'

import { appQueryClient } from '@repo/api-resources'
import type {
    FacebookCommentHideCommentData,
    FacebookCommentLikeData,
    FacebookCommentPrivateReplyData,
} from '@repo/ticket-thread/legacy-bridge'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { useAppDispatch } from 'hooks/useAppDispatch'
import * as infobarActions from 'state/infobar/actions'

type MessagesCache = {
    data: {
        data: TicketMessage[]
    }
}

export function useFacebookCommentActions() {
    const dispatch = useAppDispatch()
    const [privateReplyData, setPrivateReplyData] =
        useState<FacebookCommentPrivateReplyData | null>(null)

    const handlePrivateReply = (data: FacebookCommentPrivateReplyData) => {
        setPrivateReplyData(data)
    }

    const handlePrivateReplyToggle = () => {
        setPrivateReplyData(null)
    }

    const handleHideComment = ({
        integrationId,
        messageId,
        ticketId,
        shouldHide,
    }: FacebookCommentHideCommentData) => {
        if (!integrationId) return
        dispatch(
            infobarActions.executeAction({
                actionName: shouldHide
                    ? 'facebookHideComment'
                    : 'facebookUnhideComment',
                integrationId,
                payload: { comment_id: messageId ?? undefined },
                callback: () => {
                    void appQueryClient.invalidateQueries({
                        queryKey: queryKeys.ticketMessages.listMessages({
                            ticket_id: ticketId,
                        }),
                    })
                },
            }),
        )
    }

    const handleLike = ({
        integrationId,
        messageId,
        ticketId,
        shouldLike,
    }: FacebookCommentLikeData) => {
        if (!integrationId) return

        appQueryClient.setQueryData(
            queryKeys.ticketMessages.listMessages({ ticket_id: ticketId }),
            (cache: MessagesCache | undefined) => {
                if (!cache) return cache
                return {
                    ...cache,
                    data: {
                        ...cache.data,
                        data: cache.data.data.map((message) => {
                            if (message.message_id !== messageId) {
                                return message
                            }
                            const meta = (message.meta ?? {}) as Record<
                                string,
                                unknown
                            >
                            const facebookReactions =
                                (meta.facebook_reactions ?? {}) as Record<
                                    string,
                                    unknown
                                >
                            return {
                                ...message,
                                meta: {
                                    ...meta,
                                    facebook_reactions: {
                                        ...facebookReactions,
                                        page_reaction: shouldLike
                                            ? { reaction_type: 'LIKE' }
                                            : undefined,
                                    },
                                },
                            }
                        }),
                    },
                }
            },
        )

        dispatch(
            infobarActions.executeAction({
                actionName: shouldLike
                    ? 'facebookLikeComment'
                    : 'facebookUnlikeComment',
                integrationId,
                payload: { comment_id: messageId ?? undefined },
            }),
        )
    }

    return {
        privateReplyData,
        handlePrivateReply,
        handlePrivateReplyToggle,
        handleHideComment,
        handleLike,
    }
}
