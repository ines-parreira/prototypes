import { Box, Icon, Skeleton, Text } from '@gorgias/axiom'

type AiAgentHandoverOutcomeProps = {
    outcome: string | null
    isLoading: boolean
}

export function AiAgentHandoverOutcome({
    outcome,
    isLoading,
}: AiAgentHandoverOutcomeProps) {
    if (!isLoading && !outcome) {
        return null
    }

    return (
        <Box flexDirection="column" gap="xxs">
            <Box alignItems="center" gap="xs">
                <Icon name="ai" size="sm" />
                <Text size="md" color="content-neutral-default" variant="bold">
                    Handover reason
                </Text>
            </Box>
            {isLoading ? (
                <Skeleton />
            ) : (
                <Text size="sm" color="content-neutral-default">
                    {outcome}
                </Text>
            )}
        </Box>
    )
}
