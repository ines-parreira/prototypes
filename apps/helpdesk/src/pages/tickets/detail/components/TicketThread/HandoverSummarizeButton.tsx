import { Box, Button } from '@gorgias/axiom'

type HandoverSummarizeButtonProps = {
    messageCount: number
    isLoading: boolean
    onSummarize: () => void
}

export function HandoverSummarizeButton({
    messageCount,
    isLoading,
    onSummarize,
}: HandoverSummarizeButtonProps) {
    return (
        <Box justifyContent="center" padding="sm">
            <Button
                variant="secondary"
                size="sm"
                intent="regular"
                isDisabled={isLoading}
                onClick={onSummarize}
            >
                {isLoading
                    ? 'Summarizing...'
                    : `Summarize ${messageCount} messages`}
            </Button>
        </Box>
    )
}
