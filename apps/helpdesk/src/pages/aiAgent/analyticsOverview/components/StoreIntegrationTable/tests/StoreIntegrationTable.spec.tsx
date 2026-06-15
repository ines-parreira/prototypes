import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { StoreIntegrationTable } from 'pages/aiAgent/analyticsOverview/components/StoreIntegrationTable/StoreIntegrationTable'
import { useDownloadStoreIntegrationData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadStoreIntegrationData'
import type { StoreIntegrationEntityMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useStoreIntegrationMetrics'
import { useStoreIntegrationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useStoreIntegrationMetrics'

jest.mock('pages/aiAgent/analyticsOverview/hooks/useStoreIntegrationMetrics')
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadStoreIntegrationData',
)
jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const mockUseStoreIntegrationMetrics = assumeMock(useStoreIntegrationMetrics)
const mockUseDownloadStoreIntegrationData = assumeMock(
    useDownloadStoreIntegrationData,
)
const mockUseCustomDashboardTableColumns = assumeMock(
    useCustomDashboardTableColumns,
)
const mockChartsActionMenu = assumeMock(ChartsActionMenu)

const defaultLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
    decreaseInResolutionTime: false,
    decreaseInFirstResponseTime: false,
}

const defaultDisplayNames: Record<string, string> = {
    '1': 'My Shopify Store',
    '2': 'My BigCommerce Store',
}

const defaultData: StoreIntegrationEntityMetrics[] = [
    {
        entity: '1',
        automationRate: 0.42,
        automatedInteractions: 1200,
        handoverInteractions: 80,
        costSaved: 500,
        timeSaved: 3600,
        decreaseInResolutionTime: 7200,
        decreaseInFirstResponseTime: 1800,
    },
    {
        entity: '2',
        automationRate: 0.18,
        automatedInteractions: 300,
        handoverInteractions: 45,
        costSaved: 120,
        timeSaved: 900,
        decreaseInResolutionTime: 3600,
        decreaseInFirstResponseTime: 600,
    },
]

const renderComponent = ({
    data = defaultData,
    loadingStates = defaultLoadingStates,
    displayNames = defaultDisplayNames,
    chartId,
    withChartMenu,
    chartConfig,
    customDashboardChartSchema,
    dashboard,
}: {
    data?: StoreIntegrationEntityMetrics[]
    loadingStates?: typeof defaultLoadingStates
    displayNames?: Record<string, string>
    chartId?: string
    withChartMenu?: boolean
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
    dashboard?: DashboardSchema
} = {}) => {
    mockUseStoreIntegrationMetrics.mockReturnValue({
        data,
        loadingStates,
        displayNames,
        isLoading: false,
        isError: false,
    })
    return render(
        <StoreIntegrationTable
            chartId={chartId}
            withChartMenu={withChartMenu}
            chartConfig={chartConfig}
            customDashboardChartSchema={customDashboardChartSchema}
            dashboard={dashboard}
        />,
    )
}

describe('StoreIntegrationTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
        mockUseDownloadStoreIntegrationData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Store column with display names from the hook', () => {
        renderComponent()

        const table = screen.getByRole('table')
        expect(within(table).getByText('Store')).toBeInTheDocument()
        expect(within(table).getByText('My Shopify Store')).toBeInTheDocument()
        expect(
            within(table).getByText('My BigCommerce Store'),
        ).toBeInTheDocument()
    })

    it('renders the download button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /download/i }),
        ).toBeInTheDocument()
    })

    it('disables the download button while data is loading', () => {
        mockUseDownloadStoreIntegrationData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        renderComponent()

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })

    it('renders ChartsActionMenu with correct props when chartId and withChartMenu are provided', () => {
        renderComponent({
            chartId: 'store_integration_table',
            withChartMenu: true,
        })

        expect(mockChartsActionMenu).toHaveBeenCalledWith(
            expect.objectContaining({
                chartId: 'store_integration_table',
                chartName: 'Store',
            }),
            expect.anything(),
        )
    })

    it('does not render ChartsActionMenu without a chartId', () => {
        renderComponent()

        expect(mockChartsActionMenu).not.toHaveBeenCalled()
    })

    it('does not render ChartsActionMenu when chartId is provided but withChartMenu is false', () => {
        renderComponent({
            chartId: 'store_integration_table',
            withChartMenu: false,
        })

        expect(mockChartsActionMenu).not.toHaveBeenCalled()
    })

    it('passes exportCsvAction to ChartsActionMenu and hides the standalone download button', () => {
        renderComponent({
            chartId: 'store_integration_table',
            withChartMenu: true,
        })

        expect(mockChartsActionMenu).toHaveBeenCalledWith(
            expect.objectContaining({
                exportCsvAction: expect.objectContaining({
                    onClick: expect.any(Function),
                }),
            }),
            expect.anything(),
        )
        expect(
            screen.queryByRole('button', { name: /download/i }),
        ).not.toBeInTheDocument()
    })

    it('passes customDashboardChartSchema to useCustomDashboardTableColumns and renders the table label', () => {
        const customDashboardChartSchema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'My Dashboard',
            children: [],
            emoji: null,
            analytics_filter_id: null,
        }

        renderComponent({
            customDashboardChartSchema,
            dashboard,
            chartConfig: { label: 'Store' },
        })

        expect(mockUseCustomDashboardTableColumns).toHaveBeenCalledWith(
            expect.objectContaining({ customDashboardChartSchema, dashboard }),
        )
        expect(
            screen.getByText('Performance breakdown by Store'),
        ).toBeInTheDocument()
    })
})
