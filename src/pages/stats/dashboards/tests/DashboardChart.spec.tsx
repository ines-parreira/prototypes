import React from 'react'

import { useIsChartRestricted } from 'hooks/reporting/dashboards/useReportRestrictions'
import { DashboardChart } from 'pages/stats/dashboards/DashboardChart'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import {
    DashboardChartSchema,
    DashboardChildType,
} from 'pages/stats/dashboards/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock, renderWithDnD } from 'utils/testing'

jest.mock('pages/stats/dashboards/DashboardComponent', () => ({
    __esModule: true,
    default: jest.fn(),
    DashboardComponent: jest.fn(),
}))
const DashboardComponentMock = assumeMock(DashboardComponent)

jest.mock('hooks/reporting/dashboards/useReportRestrictions')
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
