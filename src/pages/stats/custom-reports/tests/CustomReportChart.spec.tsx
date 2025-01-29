import React from 'react'

import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {
    CustomReportChartSchema,
    CustomReportChildType,
} from 'pages/stats/custom-reports/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {assumeMock, renderWithDnD} from 'utils/testing'

jest.mock('pages/stats/custom-reports/CustomReportComponent', () => ({
    __esModule: true,
    default: jest.fn(),
    CustomReportComponent: jest.fn(),
}))
const CustomReportComponentMock = assumeMock(CustomReportComponent)

describe('CustomReportChart', () => {
    beforeEach(() => {
        CustomReportComponentMock.mockImplementation(() => <div />)
    })
    it('renders nothing if there is no config for element', () => {
        const schema: CustomReportChartSchema = {
            type: CustomReportChildType.Chart,
            config_id: 'randomString',
        }

        const {container} = renderWithDnD(
            <CustomReportChart
                onMove={jest.fn()}
                onDrop={jest.fn()}
                schema={schema}
            />
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render report component with appropriate config', () => {
        const schema: CustomReportChartSchema = {
            type: CustomReportChildType.Chart,
            config_id: OverviewChart.CustomerSatisfactionTrendCard,
        }

        renderWithDnD(
            <CustomReportChart
                onMove={jest.fn()}
                onDrop={jest.fn()}
                schema={schema}
            />
        )

        expect(CustomReportComponentMock).toHaveBeenCalledWith(
            {
                chart: schema.config_id,
                config: SupportPerformanceOverviewReportConfig,
            },
            {}
        )
    })
})
