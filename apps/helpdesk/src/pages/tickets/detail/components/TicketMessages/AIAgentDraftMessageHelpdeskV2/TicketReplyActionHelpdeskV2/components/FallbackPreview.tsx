import { Box, Text } from '@gorgias/axiom'

import css from '../TicketReplyActionHelpdeskV2.less'

type FallbackPreviewProps = {
    summaries: string[]
}

export function FallbackPreview({ summaries }: FallbackPreviewProps) {
    if (!summaries.length) {
        return (
            <Text size="sm" color="content-neutral-secondary">
                Configured
            </Text>
        )
    }

    return (
        <Box flexDirection="column" gap="xxxs">
            {summaries.map((summary) => (
                <Text key={summary} size="sm" className={css.valueText}>
                    {summary}
                </Text>
            ))}
        </Box>
    )
}
