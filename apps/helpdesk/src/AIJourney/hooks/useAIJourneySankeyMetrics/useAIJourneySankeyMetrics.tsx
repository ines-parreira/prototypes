import { useMemo } from 'react'

import type { SankeyChartData } from '@repo/reporting'

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

const ENGAGEMENT_CATEGORY = {
    REPLIED_AND_CLICKED: 'replied_and_clicked',
    REPLIED_ONLY: 'replied_only',
    CLICKED_NO_REPLY: 'clicked_no_reply',
    NO_ENGAGEMENT: 'no_engagement',
    REPLIED_AND_USED_DISCOUNT: 'replied_and_used_discount',
    USED_DISCOUNT_NO_REPLY: 'used_discount_no_reply',
} as const

export const SANKEY_NODE_TO_ENGAGEMENT_CATEGORY: Record<string, string> = {
    'Replied + used discount': ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
    'Replied + clicked': ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED,
    'Replied only': ENGAGEMENT_CATEGORY.REPLIED_ONLY,
    'Used discount (no reply)': ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
    'Clicked (no reply)': ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY,
    'No engagement': ENGAGEMENT_CATEGORY.NO_ENGAGEMENT,
}

const CLICKED = { TRUE: '1', FALSE: '0' } as const

const NODE = {
    CONVERSATIONS: 'Conversations',
    REPLIED_AND_USED_DISCOUNT: 'Replied + used discount',
    REPLIED_AND_CLICKED: 'Replied + clicked',
    REPLIED_ONLY: 'Replied only',
    USED_DISCOUNT_NO_REPLY: 'Used discount (no reply)',
    CLICKED_NO_REPLY: 'Clicked (no reply)',
    NO_ENGAGEMENT: 'No engagement',
    CONVERTED: 'Converted',
    NOT_CONVERTED: 'Not converted',
} as const

const NODE_COLORS: Record<string, string> = {
    [NODE.CONVERSATIONS]: '#B7A7FF',
    [NODE.REPLIED_AND_USED_DISCOUNT]: '#B7A7FF',
    [NODE.REPLIED_AND_CLICKED]: '#B7A7FF',
    [NODE.REPLIED_ONLY]: '#B7A7FF',
    [NODE.USED_DISCOUNT_NO_REPLY]: '#B7A7FF',
    [NODE.CLICKED_NO_REPLY]: '#B7A7FF',
    [NODE.NO_ENGAGEMENT]: '#B7A7FF',
    [NODE.CONVERTED]: '#7E55F6',
    [NODE.NOT_CONVERTED]: '#FF9780',
}

const EMPTY_DATA: SankeyChartData = { nodes: [], links: [] }

export const useAIJourneySankeyMetrics = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds: string[] | undefined,
): { data: SankeyChartData; isLoading: boolean; isError: boolean } => {
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

    const data = useMemo<SankeyChartData>(() => {
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
            ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
        )
        const repliedAndClicked = Math.max(
            0,
            getConversationCount(ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED) -
                getConvertedCount(
                    ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
                    CLICKED.TRUE,
                ),
        )
        const repliedOnly = Math.max(
            0,
            getConversationCount(ENGAGEMENT_CATEGORY.REPLIED_ONLY) -
                getConvertedCount(
                    ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
                    CLICKED.FALSE,
                ),
        )
        const usedDiscountNoReply = getConvertedCount(
            ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
        )
        const clickedNoReply = Math.max(
            0,
            getConversationCount(ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY) -
                getConvertedCount(
                    ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
                    CLICKED.TRUE,
                ),
        )
        const noEngagement = Math.max(
            0,
            getConversationCount(ENGAGEMENT_CATEGORY.NO_ENGAGEMENT) -
                getConvertedCount(
                    ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
                    CLICKED.FALSE,
                ),
        )

        // Column 2 → Column 3: converted conversations per engagement category
        const repliedAndClickedConverted = getConvertedCount(
            ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED,
        )
        const repliedOnlyConverted = getConvertedCount(
            ENGAGEMENT_CATEGORY.REPLIED_ONLY,
        )
        const clickedNoReplyConverted = getConvertedCount(
            ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY,
        )
        const noEngagementConverted = getConvertedCount(
            ENGAGEMENT_CATEGORY.NO_ENGAGEMENT,
        )

        const links: SankeyChartData['links'] = []
        const addLink = (
            source: string,
            target: string,
            value: number,
            extras?: Partial<SankeyChartData['links'][number]>,
        ) => {
            if (value > 0) links.push({ source, target, value, ...extras })
        }

        // Column 1 → Column 2
        addLink(
            NODE.CONVERSATIONS,
            NODE.REPLIED_AND_USED_DISCOUNT,
            repliedAndUsedDiscount,
        )
        addLink(NODE.CONVERSATIONS, NODE.REPLIED_AND_CLICKED, repliedAndClicked)
        addLink(NODE.CONVERSATIONS, NODE.REPLIED_ONLY, repliedOnly)
        addLink(
            NODE.CONVERSATIONS,
            NODE.USED_DISCOUNT_NO_REPLY,
            usedDiscountNoReply,
        )
        addLink(NODE.CONVERSATIONS, NODE.CLICKED_NO_REPLY, clickedNoReply)
        addLink(NODE.CONVERSATIONS, NODE.NO_ENGAGEMENT, noEngagement)

        // Column 2 → Column 3 (Replied + used discount: 100% converted)
        addLink(
            NODE.REPLIED_AND_USED_DISCOUNT,
            NODE.CONVERTED,
            repliedAndUsedDiscount,
            { isClickable: true },
        )

        // Column 2 → Column 3 (Replied + clicked)
        addLink(
            NODE.REPLIED_AND_CLICKED,
            NODE.CONVERTED,
            repliedAndClickedConverted,
            { isClickable: true },
        )
        addLink(
            NODE.REPLIED_AND_CLICKED,
            NODE.NOT_CONVERTED,
            repliedAndClicked - repliedAndClickedConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        // Column 2 → Column 3 (Replied only)
        addLink(NODE.REPLIED_ONLY, NODE.CONVERTED, repliedOnlyConverted, {
            isClickable: true,
        })
        addLink(
            NODE.REPLIED_ONLY,
            NODE.NOT_CONVERTED,
            repliedOnly - repliedOnlyConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        // Column 2 → Column 3 (Used discount no reply: 100% converted)
        addLink(
            NODE.USED_DISCOUNT_NO_REPLY,
            NODE.CONVERTED,
            usedDiscountNoReply,
            { isClickable: true },
        )

        // Column 2 → Column 3 (Clicked no reply)
        addLink(
            NODE.CLICKED_NO_REPLY,
            NODE.CONVERTED,
            clickedNoReplyConverted,
            { isClickable: true },
        )
        addLink(
            NODE.CLICKED_NO_REPLY,
            NODE.NOT_CONVERTED,
            clickedNoReply - clickedNoReplyConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        // Column 2 → Column 3 (No engagement)
        addLink(NODE.NO_ENGAGEMENT, NODE.CONVERTED, noEngagementConverted, {
            isClickable: true,
        })
        addLink(
            NODE.NO_ENGAGEMENT,
            NODE.NOT_CONVERTED,
            noEngagement - noEngagementConverted,
            { color: '#FFECEF', strokeOpacity: 0.5 },
        )

        const linkedNodeNames = new Set(
            links.flatMap((l) => [l.source, l.target]),
        )
        const nodes = Object.values(NODE)
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
