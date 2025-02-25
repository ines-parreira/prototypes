import React, { useCallback, useMemo } from 'react'

import { ContentState } from 'draft-js'
import _throttle from 'lodash/throttle'

import { useAgentActivity } from '@gorgias/realtime'

import { TicketMessageSourceType } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { TYPING_ACTIVITY_AGENT_TIMEOUT_MS } from 'state/newMessage/constants'
import { hasOnlySignatureText } from 'state/newMessage/emailExtraUtils'
import {
    getNewMessageSignature,
    getNewMessageType,
} from 'state/newMessage/selectors'
import { getTicket } from 'state/ticket/selectors'

export type TypingActivityProps = {
    handleTypingActivity: (contentState: ContentState) => void
}

export default function withTypingActivity<P>(
    WrappedComponent: React.ComponentType<P & TypingActivityProps>,
) {
    return function WithTypingActivityWrapper(props: P) {
        const { startTyping, stopTyping, getTicketActivity } =
            useAgentActivity()

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const throttledStartTyping = useCallback(
            _throttle(startTyping, TYPING_ACTIVITY_AGENT_TIMEOUT_MS, {
                trailing: false,
            }),
            [startTyping],
        )

        const currentUserId = useAppSelector(getCurrentUserId)
        const ticket = useAppSelector(getTicket)
        const newMessageSourceType = useAppSelector(getNewMessageType)
        const signature = useAppSelector(getNewMessageSignature)
        const { id: ticketId } = ticket

        const isCurrentUserTypingOnTicket = useMemo(
            () =>
                getTicketActivity(ticketId).typing.some(
                    (user) => user.id === currentUserId,
                ),
            [currentUserId, getTicketActivity, ticketId],
        )

        const handleResponseText = useCallback(
            (contentState: ContentState) => {
                if (contentState && newMessageSourceType && ticketId) {
                    const plainText = contentState.getPlainText()

                    const shouldSendTypingEvent =
                        plainText &&
                        !hasOnlySignatureText(contentState, signature) &&
                        newMessageSourceType !==
                            TicketMessageSourceType.InternalNote

                    if (shouldSendTypingEvent) {
                        throttledStartTyping()
                    } else if (isCurrentUserTypingOnTicket) {
                        throttledStartTyping.cancel()
                        stopTyping()
                    }
                }
            },
            [
                isCurrentUserTypingOnTicket,
                newMessageSourceType,
                signature,
                stopTyping,
                throttledStartTyping,
                ticketId,
            ],
        )

        return (
            <WrappedComponent
                {...props}
                handleTypingActivity={handleResponseText}
            />
        )
    }
}
