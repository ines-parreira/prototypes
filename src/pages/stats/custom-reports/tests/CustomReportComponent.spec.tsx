import React from 'react'

import { render, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import { CustomReportComponent } from 'pages/stats/custom-reports/CustomReportComponent'
import {
    CustomReportSchema,
    DashboardChartProps,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

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

    const isChartRestrictedToCurrentUser = jest.fn()

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser,
        } as any)
    })

    it('should not render if the chart is restricted', () => {
        isChartRestrictedToCurrentUser.mockReturnValueOnce(true)

        render(<CustomReportComponent chart={chart} config={config} />)

        expect(chartComponentMock).not.toHaveBeenCalled()
    })

    it('should not render chartId if featureFlag is false', () => {
        render(<CustomReportComponent chart={chart} config={config} />)

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).not.toBeInTheDocument()
    })

    it.each([true, undefined])(
        'should pass menu props if withChartMenu is true (or not set)',
        (withChartMenu) => {
            mockFlags({
                [FeatureFlagKey.AnalyticsCustomReports]: true,
            })

            render(
                <CustomReportComponent
                    chart={chart}
                    dashboard={dashboard}
                    config={config}
                    withChartMenu={withChartMenu}
                />,
            )

            expect(chartComponentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    chartId: chart,
                    dashboard: dashboard,
                }),
                {},
            )
        },
    )

    it('should not pass menu props if withChartMenu is false', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsCustomReports]: true,
        })

        render(
            <CustomReportComponent
                chart={chart}
                config={config}
                withChartMenu={false}
            />,
        )

        expect(chartComponentMock).toHaveBeenCalledWith({}, {})
        expect(chartComponentMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                chartId: chart,
                dashboard: dashboard,
            }),
        )
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
            />,
        )

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).toBeInTheDocument()
        expect(screen.queryByText(dashboard.id)).toBeInTheDocument()
        expect(chartComponentMock).toHaveBeenCalledWith(
            { chartId: chart, dashboard },
            {},
        )
    })
})
