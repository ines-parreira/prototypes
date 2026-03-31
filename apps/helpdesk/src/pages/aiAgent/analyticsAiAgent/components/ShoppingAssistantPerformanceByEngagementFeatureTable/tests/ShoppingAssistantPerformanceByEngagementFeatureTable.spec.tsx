import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import { ShoppingAssistantPerformanceByEngagementFeatureTable } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/ShoppingAssistantPerformanceByEngagementFeatureTable'
import type { ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'
import { MAP_ENGAGEMENT_TYPE_NAME } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/DownloadShoppingAssistantPerformanceByEngagementFeatureButton',
    () => ({
        DownloadShoppingAssistantPerformanceByEngagementFeatureButton: () => (
            <div>
                Download Shopping Assistant Performance By Engagement Feature
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics',
)

const mockUseShoppingAssistantPerformanceByEngagementFeatureMetrics =
    jest.requireMock(
        'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics',
    ).useShoppingAssistantPerformanceByEngagementFeatureMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    totalSales: false,
    ordersInfluenced: false,
    revenuePerInteraction: false,
}

const defaultData: ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics[] =
    [
        {
            entity: 'search_bar',
            automatedInteractions: 120,
            handoverInteractions: 12,
            totalSales: 3500,
            ordersInfluenced: 48,
            revenuePerInteraction: 29.2,
        },
        {
            entity: 'null',
            automatedInteractions: 55,
            handoverInteractions: 4,
            totalSales: 1200,
            ordersInfluenced: 14,
            revenuePerInteraction: 21.8,
        },
    ]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseShoppingAssistantPerformanceByEngagementFeatureMetrics.mockReturnValue(
        {
            data,
            loadingStates,
        },
    )

    return render(<ShoppingAssistantPerformanceByEngagementFeatureTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (
            row: ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics,
        ) => string
        DownloadButton: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            displayNames?: Record<string, string>
        }[]
    }

describe('ShoppingAssistantPerformanceByEngagementFeatureTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from the hook to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes the engagement feature columns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS,
        )
    })

    it('passes getRowKey that returns the entity value', () => {
        renderComponent()

        expect(getLastCallProps().getRowKey(defaultData[0])).toBe('search_bar')
    })

    it('passes nameColumns with engagement feature label and display names', () => {
        renderComponent()

        expect(getLastCallProps().nameColumns).toEqual([
            {
                accessor: 'entity',
                label: 'Engagement feature',
                displayNames: MAP_ENGAGEMENT_TYPE_NAME,
            },
        ])
    })

    it('renders the download button', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Download Shopping Assistant Performance By Engagement Feature',
            ),
        ).toBeInTheDocument()
    })

    it('falls back to an empty array when the hook returns no data', () => {
        mockUseShoppingAssistantPerformanceByEngagementFeatureMetrics.mockReturnValue(
            {
                data: undefined,
                loadingStates: defaultLoadingStates,
            },
        )

        render(<ShoppingAssistantPerformanceByEngagementFeatureTable />)

        expect(getLastCallProps().data).toEqual([])
    })
})
