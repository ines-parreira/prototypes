import {render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {
    CustomReportSchema,
    DashboardChartProps,
    ReportConfig,
} from 'pages/stats/custom-reports/types'

const content = 'Test'
const chart = 'chart-id'
const dashboard: CustomReportSchema = {
    id: 1,
    name: 'Test Report',
    emoji: '📊',
    children: [],
    analytics_filter_id: 123,
}

describe('<CustomReportComponent />', () => {
    const chartComponentMock = jest
        .fn()
        .mockImplementation((props: DashboardChartProps) => (
            <>
                <div>{content}</div>
                <div>{props?.chartId}</div>
                <div>{props?.dashboard?.id}</div>
            </>
        ))

    const config = {
        charts: {
            [chart]: {
                chartComponent: chartComponentMock,
            },
        },
    } as unknown as ReportConfig<string>

    it('should not render chartId if featureFlag is false', () => {
        render(<CustomReportComponent chart={chart} config={config} />)

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).not.toBeInTheDocument()
    })

    it('should render chartId and dashboardId if dashboard exists and featureFlag is true', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsCustomReports]: true,
        })

        render(
            <CustomReportComponent
                config={config}
                dashboard={dashboard}
                chart={chart}
            />
        )

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).toBeInTheDocument()
        expect(screen.queryByText(dashboard.id)).toBeInTheDocument()
        expect(chartComponentMock).toHaveBeenCalledWith(
            {chartId: chart, dashboard},
            {}
        )
    })
})
