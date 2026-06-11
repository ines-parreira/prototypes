import { useState } from 'react'

import { appQueryClient } from '@repo/api-resources'
import type {
    InstagramCommentHideCommentData,
    InstagramCommentPrivateReplyData,
} from '@repo/ticket-thread/legacy-bridge'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { useAppDispatch } from 'hooks/useAppDispatch'
import * as infobarActions from 'state/infobar/actions'

export function useInstagramCommentActions() {
    const dispatch = useAppDispatch()
    const [privateReplyData, setPrivateReplyData] =
        useState<InstagramCommentPrivateReplyData | null>(null)

    const handlePrivateReply = (data: InstagramCommentPrivateReplyData) => {
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
    }: InstagramCommentHideCommentData) => {
        if (!integrationId) return
        dispatch(
            infobarActions.executeAction({
                actionName: shouldHide
                    ? 'instagramHideComment'
                    : 'instagramUnhideComment',
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

    return {
        privateReplyData,
        handlePrivateReply,
        handlePrivateReplyToggle,
        handleHideComment,
    }
}
