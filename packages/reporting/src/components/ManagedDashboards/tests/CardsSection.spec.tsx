import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CardsSection } from '../CardsSection'
import type {
    DashboardComponentType,
    DashboardLayoutConfig,
    LayoutReportConfig,
    LayoutSection,
} from '../types'
import { ChartType } from '../types'

const TAB_ALL_AGENTS = 'all-agents'
const TAB_SUPPORT_AGENT = 'support-agent'

const DashboardComponentMock = vi.fn<DashboardComponentType<string>>(() => null)

vi.mock('../MetricsConfigurator', () => ({
    MetricsConfigurator: ({
        metrics,
    }: {
        metrics: Array<{ id: string; label: string; visibility: boolean }>
    }) => <div>MetricsConfigurator with {metrics.length} metrics</div>,
}))

vi.mock('../../ShowMoreList/ShowMoreList', async () => {
    const React = await import('react')
    return {
        ShowMoreList: ({
            children,
            containerClassName,
        }: {
            children: React.ReactNode
            containerClassName?: string
        }) => {
            const [isExpanded, setIsExpanded] = React.useState(false)
            return (
                <div
                    className={containerClassName}
                    role="region"
                    aria-label="show more list"
                >
                    <button onClick={() => setIsExpanded((v: boolean) => !v)}>
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                    {children}
                </div>
            )
        },
    }
})

const reportConfigMock: LayoutReportConfig = {
    charts: {
        kpi1: { label: 'KPI 1' },
        kpi2: { label: 'KPI 2' },
        kpi3: { label: 'KPI 3' },
        kpi4: { label: 'KPI 4' },
        kpi5: { label: 'KPI 5' },
        kpi6: { label: 'KPI 6' },
    },
}

const defaultLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: ChartType.Card,
            items: [],
        },
    ],
}

const makeSection = (
    items: Array<{
        chartId: string
        visibility: boolean
    }>,
): LayoutSection => ({
    id: 'kpis',
    type: ChartType.Card,
    items: items.map(({ chartId, visibility }) => ({
        chartId,
        gridSize: 3,
        visibility,
    })),
})

describe('CardsSection', () => {
    beforeEach(() => {
        DashboardComponentMock.mockReset()
        DashboardComponentMock.mockReturnValue(null)
    })

    describe('trend cards', () => {
        it('should render ShowMoreList', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId="ai-agent-analytics"
                    tabId={TAB_ALL_AGENTS}
                    tabName="Main"
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(
                screen.getByRole('region', { name: 'show more list' }),
            ).toBeInTheDocument()
        })

        it('should render MetricsConfigurator when dashboardId is provided', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId="ai-agent-analytics"
                    layoutConfig={defaultLayoutConfig}
                    tabId={TAB_ALL_AGENTS}
                    tabName="Main"
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(
                screen.getByText(/MetricsConfigurator with \d+ metrics/),
            ).toBeInTheDocument()
        })

        it('should pass correct keyKpisConfig (all items) to MetricsConfigurator', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                        { chartId: 'kpi3', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    dashboardId="ai-agent-analytics"
                    layoutConfig={defaultLayoutConfig}
                    tabId={TAB_ALL_AGENTS}
                    tabName="Main"
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(
                screen.getByText('MetricsConfigurator with 3 metrics'),
            ).toBeInTheDocument()
        })

        it('should only render visible items', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                        { chartId: 'kpi2', visibility: false },
                        { chartId: 'kpi3', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId="ai-agent-analytics"
                    tabId={TAB_ALL_AGENTS}
                    tabName="Main"
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(DashboardComponentMock).toHaveBeenCalledWith(
                expect.objectContaining({ chart: 'kpi1' }),
                {},
            )
            expect(DashboardComponentMock).not.toHaveBeenCalledWith(
                expect.objectContaining({ chart: 'kpi2' }),
                {},
            )
            expect(DashboardComponentMock).toHaveBeenCalledWith(
                expect.objectContaining({ chart: 'kpi3' }),
                {},
            )
        })

        it('should reset ShowMoreList expanded state when switching tabs', async () => {
            const user = userEvent.setup()
            const section = makeSection([{ chartId: 'kpi1', visibility: true }])
            const props = {
                section,
                reportConfig: reportConfigMock,
                layoutConfig: defaultLayoutConfig,
                dashboardId: 'ai-agent-analytics',
                tabName: 'Test',
                DashboardComponent: DashboardComponentMock,
            }

            const { rerender } = render(
                <CardsSection {...props} tabId={TAB_ALL_AGENTS} />,
            )

            await user.click(screen.getByRole('button', { name: 'Show more' }))
            expect(
                screen.getByRole('button', { name: 'Show less' }),
            ).toBeInTheDocument()

            rerender(<CardsSection {...props} tabId={TAB_SUPPORT_AGENT} />)

            expect(
                screen.queryByRole('button', { name: 'Show less' }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Show more' }),
            ).toBeInTheDocument()
        })
    })

    describe('enableCustomDashboards prop', () => {
        it('passes withChartMenu=true to DashboardComponent when enabled', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId="ai-agent-analytics"
                    tabId={TAB_ALL_AGENTS}
                    tabName="Main"
                    DashboardComponent={DashboardComponentMock}
                    enableCustomDashboards
                />,
            )

            expect(DashboardComponentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    chart: 'kpi1',
                    config: reportConfigMock,
                    withChartMenu: true,
                }),
                {},
            )
        })

        it('passes withChartMenu=false to DashboardComponent when disabled', () => {
            render(
                <CardsSection
                    section={makeSection([
                        { chartId: 'kpi1', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    layoutConfig={defaultLayoutConfig}
                    dashboardId="ai-agent-analytics"
                    tabId={TAB_ALL_AGENTS}
                    tabName="Main"
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(DashboardComponentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    chart: 'kpi1',
                    config: reportConfigMock,
                    withChartMenu: false,
                }),
                {},
            )
        })
    })
})
