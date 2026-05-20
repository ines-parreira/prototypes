import {
    Box,
    Button,
    Card,
    CardContent,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Icon,
    Skeleton,
    Text,
} from '@gorgias/axiom'

import type { TicketMessage } from 'models/ticket/types'
import { useAiAgentDraftMessage } from 'pages/tickets/detail/components/AIAgentDraftMessage/useAiAgentDraftMessage'

import { AIAgentUsedDataHelpdeskV2 } from './AIAgentUsedDataHelpdeskV2'
import { TicketReplyActionHelpdeskV2 } from './TicketReplyActionHelpdeskV2/TicketReplyActionHelpdeskV2'

import css from './AiAgentDraftMessageHelpdeskV2.less'

type Props = {
    ticketId: number
    message: TicketMessage
}

export function AiAgentDraftMessageHelpdeskV2({ ticketId, message }: Props) {
    const {
        draftMessage,
        executionId,
        feedbackMessage,
        handleCopyMessageAndActionsToEditor,
        summary,
        isLoading,
        feedback,
    } = useAiAgentDraftMessage({
        ticketId,
        message,
    })
    const resolvedSummary =
        summary ||
        'Drafted a response but did not send it and handed over the ticket.'

    if (isLoading) {
        return (
            <Box flexDirection="column" gap="sm" width="100%">
                <Card elevation="mid">
                    <CardContent>
                        <Box flexDirection="column" gap="sm" width="100%">
                            {Array.from({ length: 8 }, (_, index) => (
                                <Skeleton key={index} height={24} />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        )
    }

    if (!feedback || !draftMessage) {
        return null
    }

    return (
        <Box flexDirection="column" gap="sm" width="100%">
            {(summary || executionId) && (
                <Box gap="xxxs">
                    <Icon
                        name="edit-pencil"
                        color="content-neutral-secondary"
                    />
                    <div
                        className={css.summaryContent}
                        dangerouslySetInnerHTML={{
                            __html: resolvedSummary,
                        }}
                    />
                    {executionId && (
                        <Text size="sm" color="content-neutral-secondary">
                            {`Execution ID: ${executionId}`}
                        </Text>
                    )}
                </Box>
            )}

            <Box flexDirection="column" gap="sm" width="100%">
                {draftMessage?.content && (
                    <Card elevation="mid">
                        <Box gap="xxxs">
                            <Icon name="note-edit" />
                            <Text variant="bold">Drafted message</Text>
                        </Box>
                        <CardContent>
                            <div
                                className={css.draftContent}
                                dangerouslySetInnerHTML={{
                                    __html: draftMessage.content,
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {!!draftMessage?.ticketActions?.length && (
                    <Card elevation="mid">
                        <Disclosure>
                            <DisclosureHeader
                                title={
                                    <Box gap="xxxs" pl="xxs">
                                        <Icon name="tag" size="sm" />
                                        <Text variant="bold">
                                            Ticket actions
                                        </Text>
                                    </Box>
                                }
                            />
                            <DisclosurePanel>
                                <Box
                                    flexDirection="column"
                                    width="100%"
                                    gap="xxxs"
                                    className={css.ticketActionsContainer}
                                >
                                    {draftMessage.ticketActions.map(
                                        (action, index) => (
                                            <TicketReplyActionHelpdeskV2
                                                key={
                                                    action.name +
                                                    'suggestion-v2' +
                                                    index
                                                }
                                                action={action}
                                            />
                                        ),
                                    )}
                                </Box>
                            </DisclosurePanel>
                        </Disclosure>
                    </Card>
                )}
                <Box width="100%">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyMessageAndActionsToEditor}
                    >
                        Copy message and actions
                    </Button>
                </Box>
                {!!message.id && (
                    <AIAgentUsedDataHelpdeskV2
                        messageId={message.id}
                        messageFeedback={feedbackMessage}
                    />
                )}
            </Box>
        </Box>
    )
}
