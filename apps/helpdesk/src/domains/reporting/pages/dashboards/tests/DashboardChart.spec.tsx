import { assumeMock } from '@repo/testing'

import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { DashboardChart } from 'domains/reporting/pages/dashboards/DashboardChart'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { renderWithDnD } from 'utils/testing'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    __esModule: true,
    default: jest.fn(),
    DashboardComponent: jest.fn(),
}))
const DashboardComponentMock = assumeMock(DashboardComponent)

jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useIsChartRestrictedMock = assumeMock(useIsChartRestricted)

describe('DashboardChart', () => {
    beforeEach(() => {
        DashboardComponentMock.mockImplementation(() => <div />)
        useIsChartRestrictedMock.mockReturnValue(false)
    })

    it('renders nothing if there is no config for element', () => {
        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: 'randomString',
        }

        const { container } = renderWithDnD(
            <DashboardChart
                onMove={jest.fn()}
                onDrop={jest.fn()}
                findChartIndex={jest.fn()}
                schema={schema}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render report component with appropriate config', () => {
        const schema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: OverviewChart.CustomerSatisfactionTrendCard,
        }

        renderWithDnD(
            <DashboardChart
                onMove={jest.fn()}
                onDrop={jest.fn()}
                findChartIndex={jest.fn()}
                schema={schema}
            />,
        )

        expect(DashboardComponentMock).toHaveBeenCalledWith(
            {
                chart: schema.config_id,
                config: SupportPerformanceOverviewReportConfig,
            },
            {},
        )
    })
})
