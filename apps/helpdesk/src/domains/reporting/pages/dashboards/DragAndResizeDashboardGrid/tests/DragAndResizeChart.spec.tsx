import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import {
    DashboardChartSchema,
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    __esModule: true,
    default: jest.fn(),
    DashboardComponent: jest.fn(),
}))
const DashboardComponentMock = assumeMock(DashboardComponent)

jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useIsChartRestrictedMock = assumeMock(useIsChartRestricted)

describe('DragAndResizeChart', () => {
    beforeEach(() => {
        DashboardComponentMock.mockImplementation(() => <div />)
        useIsChartRestrictedMock.mockReturnValue(false)
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
})
