import { useMemo } from 'react'

import type { SankeyChartData } from '@repo/reporting'

import {
    SANKEY_ENGAGEMENT_CATEGORY,
    SANKEY_NODES_NAMES,
} from 'AIJourney/constants'
import type { SankeyNodeName } from 'AIJourney/constants'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    aiJourneySankeyConversationsQueryFactory,
    aiJourneySankeyOrdersQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'

const CLICKED = { TRUE: '1', FALSE: '0' } as const

const NODE_COLORS: Record<string, string> = {
    [SANKEY_NODES_NAMES.CONVERSATIONS]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.REPLIED_AND_USED_DISCOUNT]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.REPLIED_AND_CLICKED]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.REPLIED_ONLY]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.USED_DISCOUNT_NO_REPLY]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.CLICKED_NO_REPLY]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.NO_ENGAGEMENT]: 'var(--purple-300)',
    [SANKEY_NODES_NAMES.CONVERTED]: 'var(--purple-500)',
    [SANKEY_NODES_NAMES.NOT_CONVERTED]: 'var(--coral-500)',
}

const EMPTY_DATA: SankeyChartData<SankeyNodeName> = { nodes: [], links: [] }

export const useAIJourneySankeyMetrics = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds: string[] | undefined,
): {
    data: SankeyChartData<SankeyNodeName>
    isLoading: boolean
    isError: boolean
} => {
    const conversationsQuery = useMetricPerDimension<
        string,
        AiSalesAgentConversationsCube
    >(
        aiJourneySankeyConversationsQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        undefined,
    )

    const ordersQuery = useMetricPerDimension<string, AiSalesAgentOrdersCube>(
        aiJourneySankeyOrdersQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        undefined,
    )

    const data = useMemo<SankeyChartData<SankeyNodeName>>(() => {
        if (!conversationsQuery.data || !ordersQuery.data) {
            return EMPTY_DATA
        }

        const conversationCountByCategory = new Map<string, number>()
        conversationsQuery.data.allValues?.forEach(({ dimension, value }) => {
            conversationCountByCategory.set(dimension as string, value ?? 0)
        })

        const convertedConversationsByCategory = new Map<string, number>()
        ordersQuery.data.allData.forEach((row) => {
            const rawRow = row as Record<string, string | number | null>
            const category = rawRow[
                AiSalesAgentOrdersDimension.EngagementCategory
            ] as string
            const clicked = rawRow[
                AiSalesAgentOrdersDimension.Clicked
            ] as string
            const conversions =
                parseFloat(
                    (rawRow[
                        AiSalesAgentOrdersMeasure.ConvertedConversations
                    ] as string) ?? '0',
                ) || 0
            if (category) {
                const key = `${category}:${clicked}`
                convertedConversationsByCategory.set(
                    key,
                    (convertedConversationsByCategory.get(key) ?? 0) +
                        conversions,
                )
            }
        })

        const getConversationCount = (category: string) =>
            conversationCountByCategory.get(category) ?? 0

        const getConvertedCount = (
            category: string,
            clicked?: string,
        ): number => {
            if (clicked !== undefined) {
                return (
                    convertedConversationsByCategory.get(
                        `${category}:${clicked}`,
                    ) ?? 0
                )
            }
            let total = 0
            for (const [key, value] of convertedConversationsByCategory) {
                if (key.startsWith(`${category}:`)) total += value
            }
            return total
        }

        // Column 1 → Column 2: compute each engagement category node total
        const repliedAndUsedDiscount = getConvertedCount(
            SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
        )
        const repliedAndClicked = Math.max(
            0,
            getConversationCount(
                SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED,
            ) -
                getConvertedCount(
                    SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
                    CLICKED.TRUE,
                ),
        )
        const repliedOnly = Math.max(
            0,
            getConversationCount(SANKEY_ENGAGEMENT_CATEGORY.REPLIED_ONLY) -
                getConvertedCount(
                    SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
                    CLICKED.FALSE,
                ),
        )
        const usedDiscountNoReply = getConvertedCount(
            SANKEY_ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
        )
        const clickedNoReply = Math.max(
            0,
            getConversationCount(SANKEY_ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY) -
                getConvertedCount(
                    SANKEY_ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
                    CLICKED.TRUE,
                ),
        )
        const noEngagement = Math.max(
            0,
            getConversationCount(SANKEY_ENGAGEMENT_CATEGORY.NO_ENGAGEMENT) -
                getConvertedCount(
                    SANKEY_ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
                    CLICKED.FALSE,
                ),
        )

        // Column 2 → Column 3: converted conversations per engagement category
        const repliedAndClickedConverted = getConvertedCount(
            SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED,
        )
        const repliedOnlyConverted = getConvertedCount(
            SANKEY_ENGAGEMENT_CATEGORY.REPLIED_ONLY,
        )
        const clickedNoReplyConverted = getConvertedCount(
            SANKEY_ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY,
        )
        const noEngagementConverted = getConvertedCount(
            SANKEY_ENGAGEMENT_CATEGORY.NO_ENGAGEMENT,
        )

        const links: SankeyChartData<SankeyNodeName>['links'] = []
        const addLink = (
            source: SankeyNodeName,
            target: SankeyNodeName,
            value: number,
            extras?: Partial<SankeyChartData<SankeyNodeName>['links'][number]>,
        ) => {
            if (value > 0) links.push({ source, target, value, ...extras })
        }

        // Column 1 → Column 2
        addLink(
            SANKEY_NODES_NAMES.CONVERSATIONS,
            SANKEY_NODES_NAMES.REPLIED_AND_USED_DISCOUNT,
            repliedAndUsedDiscount,
        )
        addLink(
            SANKEY_NODES_NAMES.CONVERSATIONS,
            SANKEY_NODES_NAMES.REPLIED_AND_CLICKED,
            repliedAndClicked,
        )
        addLink(
            SANKEY_NODES_NAMES.CONVERSATIONS,
            SANKEY_NODES_NAMES.REPLIED_ONLY,
            repliedOnly,
        )
        addLink(
            SANKEY_NODES_NAMES.CONVERSATIONS,
            SANKEY_NODES_NAMES.USED_DISCOUNT_NO_REPLY,
            usedDiscountNoReply,
        )
        addLink(
            SANKEY_NODES_NAMES.CONVERSATIONS,
            SANKEY_NODES_NAMES.CLICKED_NO_REPLY,
            clickedNoReply,
        )
        addLink(
            SANKEY_NODES_NAMES.CONVERSATIONS,
            SANKEY_NODES_NAMES.NO_ENGAGEMENT,
            noEngagement,
        )

        // Column 2 → Column 3 (Replied + used discount: 100% converted)
        addLink(
            SANKEY_NODES_NAMES.REPLIED_AND_USED_DISCOUNT,
            SANKEY_NODES_NAMES.CONVERTED,
            repliedAndUsedDiscount,
            { isClickable: true },
        )

        // Column 2 → Column 3 (Replied + clicked)
        addLink(
            SANKEY_NODES_NAMES.REPLIED_AND_CLICKED,
            SANKEY_NODES_NAMES.CONVERTED,
            repliedAndClickedConverted,
            { isClickable: true },
        )
        addLink(
            SANKEY_NODES_NAMES.REPLIED_AND_CLICKED,
            SANKEY_NODES_NAMES.NOT_CONVERTED,
            repliedAndClicked - repliedAndClickedConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        // Column 2 → Column 3 (Replied only)
        addLink(
            SANKEY_NODES_NAMES.REPLIED_ONLY,
            SANKEY_NODES_NAMES.CONVERTED,
            repliedOnlyConverted,
            {
                isClickable: true,
            },
        )
        addLink(
            SANKEY_NODES_NAMES.REPLIED_ONLY,
            SANKEY_NODES_NAMES.NOT_CONVERTED,
            repliedOnly - repliedOnlyConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        // Column 2 → Column 3 (Used discount no reply: 100% converted)
        addLink(
            SANKEY_NODES_NAMES.USED_DISCOUNT_NO_REPLY,
            SANKEY_NODES_NAMES.CONVERTED,
            usedDiscountNoReply,
            { isClickable: true },
        )

        // Column 2 → Column 3 (Clicked no reply)
        addLink(
            SANKEY_NODES_NAMES.CLICKED_NO_REPLY,
            SANKEY_NODES_NAMES.CONVERTED,
            clickedNoReplyConverted,
            { isClickable: true },
        )
        addLink(
            SANKEY_NODES_NAMES.CLICKED_NO_REPLY,
            SANKEY_NODES_NAMES.NOT_CONVERTED,
            clickedNoReply - clickedNoReplyConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        // Column 2 → Column 3 (No engagement)
        addLink(
            SANKEY_NODES_NAMES.NO_ENGAGEMENT,
            SANKEY_NODES_NAMES.CONVERTED,
            noEngagementConverted,
            {
                isClickable: true,
            },
        )
        addLink(
            SANKEY_NODES_NAMES.NO_ENGAGEMENT,
            SANKEY_NODES_NAMES.NOT_CONVERTED,
            noEngagement - noEngagementConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        const linkedNodeNames = new Set(
            links.flatMap((l) => [l.source, l.target]),
        )
        const nodes = Object.values(SANKEY_NODES_NAMES)
            .filter((name) => linkedNodeNames.has(name))
            .map((name) => ({ name, color: NODE_COLORS[name] }))

        return { nodes, links }
    }, [conversationsQuery.data, ordersQuery.data])

    return {
        data,
        isLoading: conversationsQuery.isFetching || ordersQuery.isFetching,
        isError: conversationsQuery.isError || ordersQuery.isError,
    }
}
