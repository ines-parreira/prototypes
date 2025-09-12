import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'

export const abandonedCartKpisMock: MetricProps[] = [
    {
        label: 'Total Revenue',
        value: 59.99,
        prevValue: 180.02,
        series: [],
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency: 'USD',
        isLoading: true,
    },
    {
        label: 'Conversion rate',
        value: 0,
        prevValue: 0,
        series: [],
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: true,
    },
    {
        label: 'Response Rate',
        value: 0,
        prevValue: 0,
        series: [],
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        currency: 'USD',
        isLoading: true,
        drilldown: {
            title: 'Response Rate',
            metricName: 'aiJourneyResponseRate' as any,
            integrationId: '33858',
            shopName: 'artemisathletix',
        },
    },
]
