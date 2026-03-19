import { SankeyChart } from '@repo/reporting'
import type { SankeyLinkClickPayload } from '@repo/reporting'

import { SANKEY_NODE_TO_ENGAGEMENT_CATEGORY } from 'AIJourney/constants'
import type { SankeyNodeName } from 'AIJourney/constants'
import { useAIJourneySankeyMetrics } from 'AIJourney/hooks'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'

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
            SANKEY_NODE_TO_ENGAGEMENT_CATEGORY[source.name as SankeyNodeName]
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
            hoverableNodeNames={
                Object.keys(
                    SANKEY_NODE_TO_ENGAGEMENT_CATEGORY,
                ) as SankeyNodeName[]
            }
            onLinkClick={handleSankeyLinkClick}
        />
    )
}
