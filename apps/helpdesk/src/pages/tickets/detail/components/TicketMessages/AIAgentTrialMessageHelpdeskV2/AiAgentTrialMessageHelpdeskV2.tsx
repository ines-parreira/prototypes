import { Box, Button, Icon, Link, Skeleton } from '@gorgias/axiom'

import type { TicketMessage } from 'models/ticket/types'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentDraftMessage } from 'pages/tickets/detail/components/AIAgentDraftMessage/useAiAgentDraftMessage'

import { AiAgentReasoningHelpdeskV2 } from '../AiAgentReasoningHelpdeskV2'

import css from './AiAgentTrialMessageHelpdeskV2.less'

type Props = {
    ticketId: number
    message: TicketMessage
}

const PREVIEW_BANNER_COPY =
    'Let AI Agent automate tickets, freeing you to focus on strategic tasks like upselling and enhancing customer experience.'
const PREVIEW_BANNER_SUFFIX = 'and unlock these benefits.'

export function AiAgentTrialMessageHelpdeskV2({ ticketId, message }: Props) {
    const {
        draftMessage,
        feedback,
        feedbackMessage,
        handleCopyMessageToEditor,
        isLoading,
    } = useAiAgentDraftMessage({
        ticketId,
        message,
        isTrial: true,
    })

    const previewModeLink = feedbackMessage?.shopName
        ? getAiAgentNavigationRoutes(feedbackMessage.shopName).previewMode
        : undefined

    if (isLoading) {
        return (
            <Box flexDirection="column" gap="sm" width="100%">
                <Box className={css.skeletonGroup}>
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} height={24} />
                    ))}
                </Box>
            </Box>
        )
    }

    if (!feedback || !draftMessage) {
        return null
    }

    return (
        <Box flexDirection="column" gap="sm" width="100%">
            <Box className={css.previewBanner} gap="xxxs">
                <Icon
                    name="ai-alt-1"
                    size="sm"
                    color="content-accent-default"
                />
                <div className={css.previewBannerText}>
                    <span>{`${PREVIEW_BANNER_COPY} `}</span>
                    {previewModeLink ? (
                        <Link href={previewModeLink}>Enable it now</Link>
                    ) : (
                        <span className={css.enableText}>Enable it now</span>
                    )}
                    <span>{` ${PREVIEW_BANNER_SUFFIX}`}</span>
                </div>
            </Box>

            {draftMessage.content && (
                <div
                    className={css.messageContent}
                    dangerouslySetInnerHTML={{
                        __html: draftMessage.content,
                    }}
                />
            )}

            <Box width="100%">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyMessageToEditor}
                >
                    Copy message
                </Button>
            </Box>

            {!!message.id && <AiAgentReasoningHelpdeskV2 message={message} />}
        </Box>
    )
}
