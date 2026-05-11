import { Box, Button, Icon, Skeleton, Text } from '@gorgias/axiom'
import type { TicketSummary } from '@gorgias/helpdesk-types'

type SummaryContentProps = {
    isLoading: boolean
    errorMessage: string
    isRetriable: boolean
    summary: TicketSummary | null | undefined
    requestSummary: () => void
}

export function SummaryContent({
    isLoading,
    errorMessage,
    isRetriable,
    summary,
    requestSummary,
}: SummaryContentProps) {
    if (isLoading) {
        return (
            <Box flexDirection="column" gap="xxs">
                <Skeleton />
                <Skeleton />
            </Box>
        )
    }

    if (errorMessage) {
        return (
            <Box flexDirection="column" gap="xxs">
                <Box marginBottom="xxxs">
                    <Text size="sm" color="content-neutral-secondary">
                        {errorMessage}
                    </Text>
                </Box>
                {isRetriable && (
                    <div>
                        <Button
                            variant="secondary"
                            size="sm"
                            intent="regular"
                            leadingSlot={
                                <Icon name="arrow-reload-alt-1" size="sm" />
                            }
                            onClick={requestSummary}
                        >
                            Try again
                        </Button>
                    </div>
                )}
            </Box>
        )
    }

    if (summary?.content) {
        return (
            <div style={{ whiteSpace: 'pre-line' }}>
                <Text size="sm" color="content-neutral-default">
                    {summary.content}
                </Text>
            </div>
        )
    }

    return null
}
