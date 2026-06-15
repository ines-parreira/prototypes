import type {
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMarker,
} from '@repo/reporting'

export const USE_MOCK_SKILL_PERFORMANCE_CHART_DATA: boolean = false

export const mockSkillPerformanceChartData: ComposedMetricTimeSeriesDataItem[] =
    [
        { date: '2026-04-20', ticketVolume: 34, csat: 4.2 },
        { date: '2026-04-21', ticketVolume: 42, csat: 4.3 },
        { date: '2026-04-22', ticketVolume: 38, csat: 4.1 },
        { date: '2026-04-23', ticketVolume: 51, csat: 4.4 },
        { date: '2026-04-24', ticketVolume: 57, csat: 4.5 },
        { date: '2026-04-25', ticketVolume: 49, csat: 4.3 },
        { date: '2026-04-26', ticketVolume: 46, csat: 4.2 },
        { date: '2026-04-27', ticketVolume: 62, csat: 4.4 },
        { date: '2026-04-28', ticketVolume: 68, csat: 4.6 },
        { date: '2026-04-29', ticketVolume: 64, csat: 4.5 },
        { date: '2026-04-30', ticketVolume: 72, csat: 4.7 },
        { date: '2026-05-01', ticketVolume: 78, csat: 4.8 },
        { date: '2026-05-02', ticketVolume: 71, csat: 4.6 },
        { date: '2026-05-03', ticketVolume: 69, csat: 4.5 },
        { date: '2026-05-04', ticketVolume: 83, csat: 4.3 },
        { date: '2026-05-05', ticketVolume: 91, csat: 4.2 },
        { date: '2026-05-06', ticketVolume: 87, csat: 4.1 },
        { date: '2026-05-07', ticketVolume: 94, csat: 4.0 },
        { date: '2026-05-08', ticketVolume: 88, csat: 4.1 },
        { date: '2026-05-09', ticketVolume: 79, csat: 4.2 },
        { date: '2026-05-10', ticketVolume: 73, csat: 4.3 },
        { date: '2026-05-11', ticketVolume: 81, csat: 4.4 },
        { date: '2026-05-12', ticketVolume: 76, csat: 4.5 },
        { date: '2026-05-13', ticketVolume: 84, csat: 4.6 },
        { date: '2026-05-14', ticketVolume: 89, csat: 4.7 },
        { date: '2026-05-15', ticketVolume: 96, csat: 4.6 },
        { date: '2026-05-16', ticketVolume: 92, csat: 4.5 },
        { date: '2026-05-17', ticketVolume: 99, csat: 4.4 },
    ]

export const mockSkillPerformanceChartMarkers: ComposedMetricTimeSeriesMarker[] =
    [
        {
            id: 'mock-version-published-2026-04-30',
            date: '2026-04-30',
            label: 'Changes published',
            description:
                'Updated conditions to handover unfulfilled orders older than 3 days',
            actionHref:
                '/app/ai-agent/shopify/artemisathletix/skills/6192387?versionId=10868655',
        },
        {
            id: 'mock-intent-routing-2026-05-09',
            date: '2026-05-09',
            label: 'Changes published',
            description: 'Updated handover intent routing conditions',
            actionHref:
                '/app/ai-agent/shopify/artemisathletix/skills/6192387?versionId=10868658',
        },
        {
            id: 'mock-no-description-2026-05-15',
            date: '2026-05-15',
            label: 'Changes published',
            actionHref:
                '/app/ai-agent/shopify/artemisathletix/skills/6192387?versionId=10868663',
        },
    ]
