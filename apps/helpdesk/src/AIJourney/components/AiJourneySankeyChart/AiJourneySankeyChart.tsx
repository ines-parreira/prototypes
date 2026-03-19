import { SankeyChart } from '@repo/reporting'
import type { SankeyLinkClickPayload } from '@repo/reporting'

import { useAIJourneySankeyMetrics } from 'AIJourney/hooks'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'

const ENGAGEMENT_CATEGORY = {
    REPLIED_AND_CLICKED: 'replied_and_clicked',
    REPLIED_ONLY: 'replied_only',
    CLICKED_NO_REPLY: 'clicked_no_reply',
    NO_ENGAGEMENT: 'no_engagement',
    REPLIED_AND_USED_DISCOUNT: 'replied_and_used_discount',
    USED_DISCOUNT_NO_REPLY: 'used_discount_no_reply',
} as const

const SANKEY_NODE_TO_ENGAGEMENT_CATEGORY: Record<string, string> = {
    'Replied + used discount': ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
    'Replied + clicked': ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED,
    'Replied only': ENGAGEMENT_CATEGORY.REPLIED_ONLY,
    'Used discount (no reply)': ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
    'Clicked (no reply)': ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY,
    'No engagement': ENGAGEMENT_CATEGORY.NO_ENGAGEMENT,
}

export const AiJourneySankeyChart = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
}: {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds: string[] | undefined
}) => {
    const dispatch = useAppDispatch()

    const sankeyMetrics = useAIJourneySankeyMetrics(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    const handleSankeyLinkClick = ({ source }: SankeyLinkClickPayload) => {
        const engagementCategory =
            SANKEY_NODE_TO_ENGAGEMENT_CATEGORY[source.name]
        dispatch(
            setMetricData({
                title: `Converted – ${source.name}`,
                metricName: AIJourneyMetric.SankeyConversions,
                integrationId,
                journeyIds:
                    journeyIds && journeyIds.length > 0
                        ? journeyIds.map(String)
                        : undefined,
                engagementCategory,
            }),
        )
    }

    return (
        <SankeyChart
            title="Conversation funnel"
            data={sankeyMetrics.data}
            isLoading={sankeyMetrics.isLoading}
            nodeWidth={23}
            nodePadding={12}
            minNodeHeight={6}
            hoverableNodeNames={[
                'Replied + used discount',
                'Replied + clicked',
                'Replied only',
                'Used discount (no reply)',
                'Clicked (no reply)',
                'No engagement',
            ]}
            onLinkClick={handleSankeyLinkClick}
        />
    )
}
