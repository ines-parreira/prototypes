import { act, render, screen, waitFor } from '@testing-library/react'
import userEventLib from '@testing-library/user-event'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'

import { AnalyticsOverviewChart } from '../../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../../config/defaultLayoutConfig'
import type { DashboardLayoutConfig } from '../../types/layoutConfig'
import { DashboardLayoutRenderer } from './DashboardLayoutRenderer'

import css from './DashboardLayoutRenderer.less'

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: { chart: string }) => (
        <div data-testid={`chart-${chart}`} data-chart-id={chart}>
            Chart: {chart}
        </div>
    ),
}))

jest.mock('framer-motion', () => ({
    motion: {
        div: require('react').forwardRef(
            ({ children, onAnimationComplete, ...props }: any, ref: any) => {
                if (onAnimationComplete) {
                    setTimeout(() => onAnimationComplete(), 0)
                }
                return (
                    <div ref={ref} {...props}>
                        {children}
                    </div>
                )
            },
        ),
    },
}))

let resizeObserverCallback: ResizeObserverCallback | null = null

class MockResizeObserver implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback
    }

    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = MockResizeObserver as any

const createKpisLayoutConfig = (
    chartIds: string[] = ['kpi1', 'kpi2', 'kpi3', 'kpi4'],
) =>
    ({
        sections: [
            {
                id: 'kpis',
                type: 'kpis',
                items: chartIds.map((chartId) => ({ chartId, gridSize: 3 })),
            },
        ],
    }) as unknown as DashboardLayoutConfig

const createChartsLayoutConfig = () =>
    ({
        sections: [
            {
                id: 'charts',
                type: 'charts',
                items: [
                    { chartId: 'chart1', gridSize: 6 },
                    { chartId: 'chart2', gridSize: 6 },
                ],
            },
        ],
    }) as unknown as DashboardLayoutConfig

const createTableLayoutConfig = () =>
    ({
        sections: [
            {
                id: 'table',
                type: 'table',
                items: [{ chartId: 'table1', gridSize: 12 }],
            },
        ],
    }) as unknown as DashboardLayoutConfig

const createMixedLayoutConfig = () =>
    ({
        sections: [
            {
                id: 'kpis',
                type: 'kpis',
                items: [
                    { chartId: 'kpi1', gridSize: 3 },
                    { chartId: 'kpi2', gridSize: 3 },
                ],
            },
            {
                id: 'charts',
                type: 'charts',
                items: [
                    { chartId: 'chart1', gridSize: 6 },
                    { chartId: 'chart2', gridSize: 6 },
                ],
            },
            {
                id: 'table',
                type: 'table',
                items: [{ chartId: 'table1', gridSize: 12 }],
            },
        ],
    }) as unknown as DashboardLayoutConfig

describe('DashboardLayoutRenderer', () => {
    const reportConfigMock = {
        charts: {
            ['chart']: {
                chartComponent: () => <div>Chart 1</div>,
                label: 'Chart 1 Label',
                csvProducer: null,
                description: 'Description for chart 1',
                chartType: ChartType.Card,
            },
            kpi1: { chartComponent: () => null },
            kpi2: { chartComponent: () => null },
            kpi3: { chartComponent: () => null },
            kpi4: { chartComponent: () => null },
            kpi5: { chartComponent: () => null },
            chart1: { chartComponent: () => null },
            chart2: { chartComponent: () => null },
            table1: { chartComponent: () => null },
        },
    } as unknown as ReportConfig<string>

    it('should render all charts in the correct order', () => {
        render(
            <DashboardLayoutRenderer
                layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                reportConfig={reportConfigMock}
            />,
        )

        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomatedInteractionsCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(`chart-${AnalyticsOverviewChart.TimeSavedCard}`),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(`chart-${AnalyticsOverviewChart.CostSavedCard}`),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateComboChart}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationLineChart}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.PerformanceTable}`,
            ),
        ).toBeInTheDocument()
    })

    it('should fallback to default layout when config is invalid', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'invalid',
                    type: 'invalid-type' as any,
                    items: [],
                },
            ],
        } as DashboardLayoutConfig

        render(
            <DashboardLayoutRenderer
                layoutConfig={invalidConfig}
                reportConfig={reportConfigMock}
            />,
        )

        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
    })

    it('should render custom layout configuration', () => {
        const customConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: 'kpis',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 6,
                        },
                        {
                            chartId: AnalyticsOverviewChart.TimeSavedCard,
                            gridSize: 6,
                        },
                    ],
                },
            ],
        }

        render(
            <DashboardLayoutRenderer
                layoutConfig={customConfig}
                reportConfig={reportConfigMock}
            />,
        )

        expect(
            screen.getByTestId(
                `chart-${AnalyticsOverviewChart.AutomationRateCard}`,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId(`chart-${AnalyticsOverviewChart.TimeSavedCard}`),
        ).toBeInTheDocument()
    })

    describe('KPIs section with tabKey', () => {
        it('should render KPI items without tabKey', () => {
            render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi3')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi4')).toBeInTheDocument()
        })

        it('should render KPI items with tabKey', () => {
            render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                    tabKey="test-tab"
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi3')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi4')).toBeInTheDocument()
        })

        it('should toggle wrapped state when scrollable section is clicked', async () => {
            const user = userEventLib.setup()

            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50))
            })

            const kpisSection = container.querySelector(
                '[class*="kpisSection"]',
            )
            expect(kpisSection).toBeInTheDocument()

            Object.defineProperty(kpisSection, 'scrollWidth', {
                value: 1000,
                configurable: true,
            })
            Object.defineProperty(kpisSection, 'clientWidth', {
                value: 500,
                configurable: true,
            })

            if (resizeObserverCallback && kpisSection) {
                await act(async () => {
                    resizeObserverCallback?.(
                        [] as ResizeObserverEntry[],
                        {} as ResizeObserver,
                    )
                })
            }

            await waitFor(() => {
                expect(kpisSection).toHaveClass(css.clickable)
            })

            await act(() => user.click(kpisSection!))

            expect(kpisSection).toHaveClass(css.wrapped)
        })

        it('should not toggle wrapped state when section is not scrollable', async () => {
            const user = userEventLib.setup()

            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            const kpisSection = container.querySelector(
                '[class*="kpisSection"]',
            )
            expect(kpisSection).toBeInTheDocument()

            Object.defineProperty(kpisSection, 'scrollWidth', {
                value: 500,
                configurable: true,
            })
            Object.defineProperty(kpisSection, 'clientWidth', {
                value: 500,
                configurable: true,
            })

            await act(async () => {
                window.dispatchEvent(new Event('resize'))
            })

            await act(() => user.click(kpisSection!))

            expect(kpisSection).not.toHaveClass(css.wrapped)
        })

        it('should add clickable class when section is scrollable', async () => {
            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50))
            })

            const kpisSection = container.querySelector(
                '[class*="kpisSection"]',
            )

            Object.defineProperty(kpisSection, 'scrollWidth', {
                value: 1000,
                configurable: true,
            })
            Object.defineProperty(kpisSection, 'clientWidth', {
                value: 500,
                configurable: true,
            })

            if (resizeObserverCallback && kpisSection) {
                await act(async () => {
                    resizeObserverCallback?.(
                        [] as ResizeObserverEntry[],
                        {} as ResizeObserver,
                    )
                })
            }

            await waitFor(() => {
                expect(kpisSection).toHaveClass(css.clickable)
            })
        })

        it('should toggle back to unwrapped state on second click', async () => {
            const user = userEventLib.setup()

            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50))
            })

            const kpisSection = container.querySelector(
                '[class*="kpisSection"]',
            )

            Object.defineProperty(kpisSection, 'scrollWidth', {
                value: 1000,
                configurable: true,
            })
            Object.defineProperty(kpisSection, 'clientWidth', {
                value: 500,
                configurable: true,
            })

            if (resizeObserverCallback && kpisSection) {
                await act(async () => {
                    resizeObserverCallback?.(
                        [] as ResizeObserverEntry[],
                        {} as ResizeObserver,
                    )
                })
            }

            await waitFor(() => {
                expect(kpisSection).toHaveClass(css.clickable)
            })

            await act(() => user.click(kpisSection!))
            expect(kpisSection).toHaveClass(css.wrapped)

            await act(() => user.click(kpisSection!))
            expect(kpisSection).not.toHaveClass(css.wrapped)
        })
    })

    describe('Charts section', () => {
        it('should render chart items with flex wrap', () => {
            render(
                <DashboardLayoutRenderer
                    layoutConfig={createChartsLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(screen.getByText('Chart: chart1')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart2')).toBeInTheDocument()
        })

        it('should apply correct minWidth for charts section', () => {
            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createChartsLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            const chartItems = container.querySelectorAll(
                '[data-chart-id="chart1"], [data-chart-id="chart2"]',
            )
            expect(chartItems).toHaveLength(2)
        })
    })

    describe('Table section', () => {
        it('should render table items', () => {
            render(
                <DashboardLayoutRenderer
                    layoutConfig={createTableLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
        })

        it('should apply correct minWidth for table section', () => {
            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createTableLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            const tableItem = container.querySelector(
                '[data-chart-id="table1"]',
            )
            expect(tableItem).toBeInTheDocument()
        })
    })

    describe('Mixed sections', () => {
        it('should render all section types correctly', () => {
            render(
                <DashboardLayoutRenderer
                    layoutConfig={createMixedLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(screen.getByText('Chart: kpi1')).toBeInTheDocument()
            expect(screen.getByText('Chart: kpi2')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart1')).toBeInTheDocument()
            expect(screen.getByText('Chart: chart2')).toBeInTheDocument()
            expect(screen.getByText('Chart: table1')).toBeInTheDocument()
        })
    })

    describe('Entrance animations', () => {
        it('should handle more than 4 KPIs with cycling animations', () => {
            const manyKpisConfig = createKpisLayoutConfig([
                'kpi1',
                'kpi2',
                'kpi3',
                'kpi4',
                'kpi5',
            ])

            render(
                <DashboardLayoutRenderer
                    layoutConfig={manyKpisConfig}
                    reportConfig={reportConfigMock}
                />,
            )

            const kpiElements = screen.getAllByText(/Chart: kpi/)
            expect(kpiElements).toHaveLength(5)
        })
    })

    describe('Resize handling', () => {
        it('should update scrollable state when ResizeObserver detects changes', async () => {
            const { container } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50))
            })

            const kpisSection = container.querySelector(
                '[class*="kpisSection"]',
            )

            Object.defineProperty(kpisSection, 'scrollWidth', {
                value: 500,
                configurable: true,
                writable: true,
            })
            Object.defineProperty(kpisSection, 'clientWidth', {
                value: 500,
                configurable: true,
                writable: true,
            })

            if (resizeObserverCallback && kpisSection) {
                await act(async () => {
                    resizeObserverCallback?.(
                        [] as ResizeObserverEntry[],
                        {} as ResizeObserver,
                    )
                })
            }

            await waitFor(() => {
                expect(kpisSection).not.toHaveClass(css.clickable)
            })

            Object.defineProperty(kpisSection, 'scrollWidth', {
                value: 1000,
                configurable: true,
                writable: true,
            })

            if (resizeObserverCallback && kpisSection) {
                await act(async () => {
                    resizeObserverCallback?.(
                        [] as ResizeObserverEntry[],
                        {} as ResizeObserver,
                    )
                })
            }

            await waitFor(() => {
                expect(kpisSection).toHaveClass(css.clickable)
            })
        })

        it('should cleanup ResizeObserver on unmount', async () => {
            const disconnectSpy = jest.spyOn(
                MockResizeObserver.prototype,
                'disconnect',
            )

            const { unmount } = render(
                <DashboardLayoutRenderer
                    layoutConfig={createKpisLayoutConfig()}
                    reportConfig={reportConfigMock}
                />,
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
            })

            unmount()

            expect(disconnectSpy).toHaveBeenCalled()

            disconnectSpy.mockRestore()
        })
    })
})
