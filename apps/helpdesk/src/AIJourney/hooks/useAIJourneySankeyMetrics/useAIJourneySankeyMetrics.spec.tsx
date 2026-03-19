import { renderHook } from '@testing-library/react'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'

import { useAIJourneySankeyMetrics } from './useAIJourneySankeyMetrics'

jest.mock('domains/reporting/hooks/useMetricPerDimension')

const mockIntegrationId = '123'
const mockUserTimezone = 'America/New_York'
const mockFilters = {
    period: {
        start_datetime: '2025-07-03T00:00:00Z',
        end_datetime: '2025-07-31T23:59:59Z',
    },
}
const mockJourneyIds = ['journey-1', 'journey-2']

const makeQ1Row = (engagementCategory: string, count: string) => ({
    [AiSalesAgentConversationsDimension.EngagementCategory]: engagementCategory,
    'AiSalesAgentConversations.count': count,
    decile: null,
})

const makeQ2Row = (
    engagementCategory: string,
    clicked: string,
    convertedConversations: string,
) => ({
    [AiSalesAgentOrdersDimension.EngagementCategory]: engagementCategory,
    [AiSalesAgentOrdersDimension.Clicked]: clicked,
    [AiSalesAgentOrdersMeasure.ConvertedConversations]: convertedConversations,
    decile: null,
})

const renderSankeyHook = () =>
    renderHook(() =>
        useAIJourneySankeyMetrics(
            mockIntegrationId,
            mockUserTimezone,
            mockFilters,
            mockJourneyIds,
        ),
    )

describe('useAIJourneySankeyMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns empty data while loading', () => {
        ;(useMetricPerDimension as jest.Mock).mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderSankeyHook()

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toEqual({ nodes: [], links: [] })
    })

    it('returns empty data on error', () => {
        ;(useMetricPerDimension as jest.Mock).mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderSankeyHook()

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(true)
        expect(result.current.data).toEqual({ nodes: [], links: [] })
    })

    it('builds correct sankey nodes and links from Q1 and Q2 data', () => {
        ;(useMetricPerDimension as jest.Mock).mockImplementation((query) => {
            if (query.measures[0] === 'AiSalesAgentConversations.count') {
                return {
                    data: {
                        allValues: [
                            { dimension: 'replied_and_clicked', value: 100 },
                            { dimension: 'replied_only', value: 80 },
                            { dimension: 'clicked_no_reply', value: 60 },
                            { dimension: 'no_engagement', value: 40 },
                        ],
                        allData: [
                            makeQ1Row('replied_and_clicked', '100'),
                            makeQ1Row('replied_only', '80'),
                            makeQ1Row('clicked_no_reply', '60'),
                            makeQ1Row('no_engagement', '40'),
                        ],
                        value: null,
                        decile: null,
                    },
                    isFetching: false,
                    isError: false,
                }
            }
            return {
                data: {
                    allValues: [],
                    allData: [
                        makeQ2Row('replied_and_used_discount', '1', '10'),
                        makeQ2Row('replied_and_used_discount', '0', '5'),
                        makeQ2Row('replied_and_clicked', '1', '20'),
                        makeQ2Row('replied_only', '0', '15'),
                        makeQ2Row('used_discount_no_reply', '1', '8'),
                        makeQ2Row('used_discount_no_reply', '0', '3'),
                        makeQ2Row('clicked_no_reply', '1', '12'),
                        makeQ2Row('no_engagement', '0', '2'),
                    ],
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            }
        })

        const { result } = renderSankeyHook()

        const { nodes, links } = result.current.data

        expect(nodes).toHaveLength(9)
        expect(nodes.map((n) => n.name)).toEqual([
            'Conversations',
            'Replied + used discount',
            'Replied + clicked',
            'Replied only',
            'Used discount (no reply)',
            'Clicked (no reply)',
            'No engagement',
            'Converted',
            'Not converted',
        ])

        const findLink = (source: string, target: string) =>
            links.find((l) => l.source === source && l.target === target)

        // Column 1 → Column 2
        // Replied + used discount = Q2[replied_and_used_discount] = 10 + 5 = 15
        expect(
            findLink('Conversations', 'Replied + used discount')?.value,
        ).toBe(15)
        // Replied + clicked = Q1[replied_and_clicked](100) - Q2[replied_and_used_discount, clicked=1](10) = 90
        expect(findLink('Conversations', 'Replied + clicked')?.value).toBe(90)
        // Replied only = Q1[replied_only](80) - Q2[replied_and_used_discount, clicked=0](5) = 75
        expect(findLink('Conversations', 'Replied only')?.value).toBe(75)
        // Used discount (no reply) = Q2[used_discount_no_reply] = 8 + 3 = 11
        expect(
            findLink('Conversations', 'Used discount (no reply)')?.value,
        ).toBe(11)
        // Clicked (no reply) = Q1[clicked_no_reply](60) - Q2[used_discount_no_reply, clicked=1](8) = 52
        expect(findLink('Conversations', 'Clicked (no reply)')?.value).toBe(52)
        // No engagement = Q1[no_engagement](40) - Q2[used_discount_no_reply, clicked=0](3) = 37
        expect(findLink('Conversations', 'No engagement')?.value).toBe(37)

        // Column 2 → Column 3
        expect(findLink('Replied + used discount', 'Converted')?.value).toBe(15)
        expect(findLink('Replied + clicked', 'Converted')?.value).toBe(20)
        expect(findLink('Replied + clicked', 'Not converted')?.value).toBe(70)
        expect(findLink('Replied only', 'Converted')?.value).toBe(15)
        expect(findLink('Replied only', 'Not converted')?.value).toBe(60)
        expect(findLink('Used discount (no reply)', 'Converted')?.value).toBe(
            11,
        )
        expect(findLink('Clicked (no reply)', 'Converted')?.value).toBe(12)
        expect(findLink('Clicked (no reply)', 'Not converted')?.value).toBe(40)
        expect(findLink('No engagement', 'Converted')?.value).toBe(2)
        expect(findLink('No engagement', 'Not converted')?.value).toBe(35)
    })

    it('omits links with zero value', () => {
        ;(useMetricPerDimension as jest.Mock).mockImplementation((query) => {
            if (query.measures[0] === 'AiSalesAgentConversations.count') {
                return {
                    data: {
                        allValues: [
                            { dimension: 'replied_and_clicked', value: 0 },
                            { dimension: 'no_engagement', value: 10 },
                        ],
                        allData: [],
                        value: null,
                        decile: null,
                    },
                    isFetching: false,
                    isError: false,
                }
            }
            return {
                data: {
                    allValues: [],
                    allData: [makeQ2Row('no_engagement', '0', '2')],
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            }
        })

        const { result } = renderSankeyHook()
        const { links } = result.current.data

        expect(
            links.find((l) => l.target === 'Replied + clicked'),
        ).toBeUndefined()
        expect(
            links.find(
                (l) => l.source === 'No engagement' && l.target === 'Converted',
            )?.value,
        ).toBe(2)
    })

    it('clamps negative node values to zero', () => {
        ;(useMetricPerDimension as jest.Mock).mockImplementation((query) => {
            if (query.measures[0] === 'AiSalesAgentConversations.count') {
                return {
                    data: {
                        allValues: [
                            { dimension: 'replied_and_clicked', value: 5 },
                        ],
                        allData: [],
                        value: null,
                        decile: null,
                    },
                    isFetching: false,
                    isError: false,
                }
            }
            return {
                data: {
                    allValues: [],
                    allData: [
                        makeQ2Row('replied_and_used_discount', '1', '10'),
                    ],
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            }
        })

        const { result } = renderSankeyHook()
        const { links } = result.current.data

        expect(
            links.find((l) => l.target === 'Replied + clicked'),
        ).toBeUndefined()
    })
})
