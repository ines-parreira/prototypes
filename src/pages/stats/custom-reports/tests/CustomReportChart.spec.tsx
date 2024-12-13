import {render} from '@testing-library/react'

import React from 'react'

import {CustomReportComponent} from 'pages/stats/common/CustomReport/CustomReportComponent'

import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {
    CustomReportChartSchema,
    CustomReportChildType,
} from 'pages/stats/custom-reports/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/common/CustomReport/CustomReportComponent', () => ({
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

        const {container} = render(<CustomReportChart schema={schema} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('should render report component with appropriate config', () => {
        const schema: CustomReportChartSchema = {
            type: CustomReportChildType.Chart,
            config_id: OverviewChart.CustomerSatisfactionTrendCard,
        }

        render(<CustomReportChart schema={schema} />)

        expect(CustomReportComponentMock).toHaveBeenCalledWith(
            {
                chart: schema.config_id,
                config: SupportPerformanceOverviewReportConfig,
            },
            {}
        )
    })
})
