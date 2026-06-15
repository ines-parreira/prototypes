import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { Banner, Box, Link, Text } from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { useTicketThreadLegacyBridge } from '../../../../legacy-bridge'
import { useDeleteTicketThreadMessage } from '../../../hooks/useDeleteTicketThreadMessage'
import { useUpdateTicketThreadMessage } from '../../../hooks/useUpdateTicketThreadMessage'
import { FailedActionsDisclosure } from './FailedActionsDisclosure'
import { TicketMessageErrorContent } from './TicketMessageErrorContent'
import { TicketMessageErrorFooter } from './TicketMessageErrorFooter'
import { TicketMessageErrorTitle } from './TicketMessageErrorTitle'
import { YOTPO_COMMENT_GUIDE_URL } from './utils/getMessageErrorState'
import { getFailedActions } from './utils/messageErrorActions'
import { splitErrorBannerMessage } from './utils/splitErrorBannerMessage'

import css from './TicketMessageError.less'

type TicketMessageErrorProps = {
    error: ReactNode
    retryTooltipMessage?: string
    ticketId: number
    message: TicketMessage
    messageId?: number | null
    messageActions?: TicketMessage['actions']
    isRetriable?: boolean
    isForceable?: boolean
    isCancelable?: boolean
}

export function TicketMessageError({
    error,
    retryTooltipMessage = 'Retry to send the message.',
    ticketId,
    message,
    messageId,
    messageActions,
    isRetriable,
    isForceable,
    isCancelable,
}: TicketMessageErrorProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { deleteTicketThreadMessage } = useDeleteTicketThreadMessage()
    const { updateTicketThreadMessage } = useUpdateTicketThreadMessage()
    const {
        legacyActions: { deleteTicketPendingMessage, retrySubmitTicketMessage },
        legacyState: {
            newMessage: { isSubmittingMessage },
        },
    } = useTicketThreadLegacyBridge()

    const failedActions = useMemo(
        () => getFailedActions(messageActions),
        [messageActions],
    )
    const splitError = useMemo(() => {
        if (typeof error !== 'string') {
            return null
        }

        return splitErrorBannerMessage(error)
    }, [error])
    const shouldRenderErrorTitle =
        typeof error !== 'string' || Boolean(splitError?.title)

    const runAction = useCallback(async (action: () => Promise<unknown>) => {
        setIsLoading(true)

        try {
            await action()
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleRetry = useCallback(
        () =>
            runAction(async () => {
                if (messageId) {
                    await updateTicketThreadMessage({
                        action: 'retry',
                        ticketId,
                        messageId,
                        data: {},
                    })
                    return
                }

                await retrySubmitTicketMessage(message)
            }),
        [
            message,
            messageId,
            retrySubmitTicketMessage,
            runAction,
            ticketId,
            updateTicketThreadMessage,
        ],
    )

    const handleCancel = useCallback(
        () =>
            runAction(async () => {
                if (messageId) {
                    await deleteTicketThreadMessage({ ticketId, messageId })
                    return
                }

                await deleteTicketPendingMessage(message)
            }),
        [
            deleteTicketThreadMessage,
            deleteTicketPendingMessage,
            message,
            messageId,
            runAction,
            ticketId,
        ],
    )

    const handleForce = useCallback(
        () =>
            messageId
                ? runAction(() =>
                      updateTicketThreadMessage({
                          action: 'force',
                          ticketId,
                          messageId,
                          data: {},
                      }),
                  )
                : undefined,
        [messageId, runAction, ticketId, updateTicketThreadMessage],
    )

    return (
        <div className={css.messageErrorContainer}>
            <Banner
                description={
                    splitError?.content ? (
                        <TicketMessageErrorContent
                            content={splitError.content}
                        />
                    ) : undefined
                }
                icon="warning-triangle"
                isClosable={false}
                intent="destructive"
                title={
                    shouldRenderErrorTitle ? (
                        <TicketMessageErrorTitle
                            error={error}
                            title={splitError?.title}
                        />
                    ) : undefined
                }
            >
                <Box className={css.content} flexDirection="column" gap="xs">
                    {failedActions.length > 0 ? (
                        <FailedActionsDisclosure actions={failedActions} />
                    ) : null}
                    <TicketMessageErrorFooter
                        isCancelable={isCancelable}
                        isForceable={isForceable}
                        isLoading={isLoading}
                        isRetriable={isRetriable}
                        isSubmittingMessage={isSubmittingMessage}
                        onCancel={handleCancel}
                        onForce={handleForce}
                        onRetry={handleRetry}
                        retryTooltipMessage={retryTooltipMessage}
                    />
                </Box>
            </Banner>
        </div>
    )
}

export function YotpoCommentGuideLink() {
    return (
        <Text size="sm">
            This comment can not be sent as this review has already received a
            comment from your account. Check out Yotpo&apos;s{' '}
            <Link
                href={YOTPO_COMMENT_GUIDE_URL}
                rel="noopener noreferrer"
                target="_blank"
                size="sm"
            >
                Comment guide
            </Link>{' '}
            for more information.
        </Text>
    )
}
