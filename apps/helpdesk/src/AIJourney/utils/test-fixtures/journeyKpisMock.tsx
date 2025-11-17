import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'

export const journeyKpisMock: MetricProps[] = [
    {
        label: 'Total Revenue',
        value: 59.99,
        prevValue: 180.02,
        series: [
            {
                dateTime: '2025-08-11T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.gmvUsd',
            },
            {
                dateTime: '2025-08-18T00:00:00.000',
                value: 59.99,
                label: 'AiSalesAgentOrders.gmvUsd',
                rawData: {
                    'AiSalesAgentOrders.currency': 'USD',
                    'AiSalesAgentOrders.periodStart.week':
                        '2025-08-18T00:00:00.000',
                    'AiSalesAgentOrders.periodStart': '2025-08-18T00:00:00.000',
                    'AiSalesAgentOrders.gmvUsd': '59.99',
                },
            },
            {
                dateTime: '2025-08-25T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.gmvUsd',
            },
            {
                dateTime: '2025-09-01T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.gmvUsd',
            },
            {
                dateTime: '2025-09-08T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.gmvUsd',
            },
        ],
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency: 'USD',
        isLoading: false,
    },
    {
        label: 'Total Orders',
        value: 1,
        prevValue: 7,
        series: [
            {
                dateTime: '2025-08-11T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
            {
                dateTime: '2025-08-18T00:00:00.000',
                value: 1,
                label: 'AiSalesAgentOrders.count',
                rawData: {
                    'AiSalesAgentOrders.periodStart.week':
                        '2025-08-18T00:00:00.000',
                    'AiSalesAgentOrders.periodStart': '2025-08-18T00:00:00.000',
                    'AiSalesAgentOrders.count': '1',
                },
            },
            {
                dateTime: '2025-08-25T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
            {
                dateTime: '2025-09-01T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
            {
                dateTime: '2025-09-08T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
        ],
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: false,
        drilldown: {
            title: 'Total Orders',
            metricName: 'aiJourneyTotalOrders' as any,
            integrationId: '33858',
            shopName: 'shopify:artemisathletix',
        },
    },
    {
        label: 'Conversion rate',
        value: 1.5873015873015872,
        prevValue: 20,
        series: [
            {
                dateTime: '2025-08-11T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
            {
                dateTime: '2025-08-18T00:00:00.000',
                value: 14.285714285714285,
                label: 'AiSalesAgentOrders.count',
                rawData: {
                    'AiSalesAgentOrders.periodStart.week':
                        '2025-08-18T00:00:00.000',
                    'AiSalesAgentOrders.periodStart': '2025-08-18T00:00:00.000',
                    'AiSalesAgentOrders.count': '1',
                },
            },
            {
                dateTime: '2025-08-25T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
            {
                dateTime: '2025-09-01T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
            {
                dateTime: '2025-09-08T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentOrders.count',
            },
        ],
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: false,
    },
    {
        label: 'Click Through Rate',
        value: 4.761904761904762,
        prevValue: 0,
        series: [
            {
                dateTime: '2025-08-11T00:00:00.000',
                value: 0,
            },
            {
                dateTime: '2025-08-18T00:00:00.000',
                value: 14.285714285714285,
            },
            {
                dateTime: '2025-08-25T00:00:00.000',
                value: 6.896551724137931,
            },
            {
                dateTime: '2025-09-01T00:00:00.000',
                value: 0,
            },
            {
                dateTime: '2025-09-08T00:00:00.000',
                value: 0,
            },
        ],
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        currency: 'USD',
        isLoading: false,
        drilldown: {
            title: 'Click Through Rate',
            metricName: 'aiJourneyClickThroughRate' as any,
            integrationId: '33858',
            shopName: 'shopify:artemisathletix',
        },
    },
    {
        label: 'Response Rate',
        value: 3.1746031746031744,
        prevValue: 14.285714285714285,
        series: [
            {
                dateTime: '2025-08-11T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentConversations.count',
            },
            {
                dateTime: '2025-08-18T00:00:00.000',
                value: 14.285714285714285,
                label: 'AiSalesAgentConversations.count',
                rawData: {
                    'AiSalesAgentConversations.periodStart.week':
                        '2025-08-18T00:00:00.000',
                    'AiSalesAgentConversations.periodStart':
                        '2025-08-18T00:00:00.000',
                    'AiSalesAgentConversations.count': '1',
                },
            },
            {
                dateTime: '2025-08-25T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentConversations.count',
            },
            {
                dateTime: '2025-09-01T00:00:00.000',
                value: 0,
                label: 'AiSalesAgentConversations.count',
            },
            {
                dateTime: '2025-09-08T00:00:00.000',
                value: 5.88235294117647,
                label: 'AiSalesAgentConversations.count',
                rawData: {
                    'AiSalesAgentConversations.periodStart.week':
                        '2025-09-08T00:00:00.000',
                    'AiSalesAgentConversations.periodStart':
                        '2025-09-08T00:00:00.000',
                    'AiSalesAgentConversations.count': '1',
                },
            },
        ],
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        currency: 'USD',
        isLoading: false,
        drilldown: {
            title: 'Response Rate',
            metricName: 'aiJourneyResponseRate' as any,
            integrationId: '33858',
            shopName: 'shopify:artemisathletix',
        },
    },
]
