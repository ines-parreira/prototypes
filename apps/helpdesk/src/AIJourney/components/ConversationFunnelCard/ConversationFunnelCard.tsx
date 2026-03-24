import { SankeyChart } from '@repo/reporting'
import type { SankeyChartProps } from '@repo/reporting'

import { Box, Card, Heading } from '@gorgias/axiom'

import css from './ConversationFunnelCard.less'

export const ConversationFunnelCard = (
    sankeyChartProps: SankeyChartProps<string>,
) => (
    <Card className={css.cardContainer} padding="lg">
        <Box flexDirection="column" gap="md">
            <Heading size="sm">Conversation funnel</Heading>
            <SankeyChart {...sankeyChartProps} />
        </Box>
    </Card>
)
