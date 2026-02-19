import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type {
    DashboardChartProps,
    DashboardSchema,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const content = 'Test'
const chart = 'chart-id'
const dashboard: DashboardSchema = {
    id: 1,
    name: 'Test Report',
    emoji: '📊',
    children: [],
    analytics_filter_id: 123,
}

describe('<DashboardComponent />', () => {
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

        render(<DashboardComponent chart={chart} config={config} />)

        expect(chartComponentMock).not.toHaveBeenCalled()
    })

    it.each([true, undefined])(
        'should pass menu props if withChartMenu is true (or not set)',
        (withChartMenu) => {
            render(
                <DashboardComponent
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
        render(
            <DashboardComponent
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

    it('should render chartId and dashboardId if dashboard exists', () => {
        render(
            <DashboardComponent
                config={config}
                dashboard={dashboard}
                chart={chart}
            />,
        )

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).toBeInTheDocument()
        expect(screen.queryByText(dashboard.id)).toBeInTheDocument()
        expect(chartComponentMock).toHaveBeenCalledWith(
            {
                chartId: chart,
                dashboard,
                chartConfig: { chartComponent: chartComponentMock },
            },
            {},
        )
    })
})
