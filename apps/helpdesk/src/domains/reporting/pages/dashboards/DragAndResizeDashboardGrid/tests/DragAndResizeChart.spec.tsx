import { assumeMock, render } from '@repo/testing'

import { useMigratedChartId } from 'domains/reporting/hooks/dashboards/useMigratedChartId'
import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { AutomateOverviewChart } from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {
    AnalyticsOverviewChart,
    AnalyticsOverviewReportConfig,
} from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    __esModule: true,
    default: jest.fn(),
    DashboardComponent: jest.fn(),
}))
const DashboardComponentMock = assumeMock(DashboardComponent)

jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useIsChartRestrictedMock = assumeMock(useIsChartRestricted)

jest.mock('domains/reporting/hooks/dashboards/useMigratedChartId')
const useMigratedChartIdMock = assumeMock(useMigratedChartId)

describe('DragAndResizeChart', () => {
    beforeEach(() => {
        DashboardComponentMock.mockImplementation(() => <div />)
        useIsChartRestrictedMock.mockReturnValue(false)
        useMigratedChartIdMock.mockImplementation((chartId: string) => chartId)
    })

    it('renders nothing if there is no config for element', () => {
        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: 'randomString',
        }

        const { container } = render(<DragAndResizeChart schema={schema} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing if chart is restricted', () => {
        useIsChartRestrictedMock.mockReturnValue(true)

        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: OverviewChart.CustomerSatisfactionTrendCard,
        }

        const { container } = render(<DragAndResizeChart schema={schema} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when useMigratedChartId returns null', () => {
        useMigratedChartIdMock.mockReturnValue(null)

        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: AutomateOverviewChart.AutomationRateKPIChart,
        }

        const { container } = render(<DragAndResizeChart schema={schema} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('should render dashboard component with appropriate config', () => {
        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: OverviewChart.CustomerSatisfactionTrendCard,
        }

        render(<DragAndResizeChart schema={schema} />)

        expect(DashboardComponentMock).toHaveBeenCalledWith(
            {
                chart: schema.config_id,
                config: SupportPerformanceOverviewReportConfig,
                dashboard: undefined,
            },
            {},
        )
    })

    it('should render dashboard component with dashboard prop when provided', () => {
        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: OverviewChart.CustomerSatisfactionTrendCard,
        }

        const mockDashboard: DashboardSchema = {
            id: 1,
            name: 'Test Dashboard',
            analytics_filter_id: null,
            children: [],
            emoji: null,
        }

        render(<DragAndResizeChart schema={schema} dashboard={mockDashboard} />)

        expect(DashboardComponentMock).toHaveBeenCalledWith(
            {
                chart: schema.config_id,
                config: SupportPerformanceOverviewReportConfig,
                dashboard: mockDashboard,
            },
            {},
        )
    })

    it('renders the new chart when useMigratedChartId returns a replacement id', () => {
        useMigratedChartIdMock.mockReturnValue(
            AnalyticsOverviewChart.AutomationRateCard,
        )

        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: AutomateOverviewChart.AutomationRateKPIChart,
        }

        render(<DragAndResizeChart schema={schema} />)

        expect(DashboardComponentMock).toHaveBeenCalledWith(
            {
                chart: AnalyticsOverviewChart.AutomationRateCard,
                config: AnalyticsOverviewReportConfig,
                dashboard: undefined,
            },
            {},
        )
    })
})
