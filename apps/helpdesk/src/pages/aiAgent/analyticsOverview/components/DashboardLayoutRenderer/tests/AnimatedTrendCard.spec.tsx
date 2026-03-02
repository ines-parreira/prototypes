import { render } from '@testing-library/react'

import { AnimatedTrendCard } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/AnimatedTrendCard'
import type {
    AnalyticsChartType,
    LayoutItem,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const DashboardComponentMock = jest.fn(({ chart }: any) => (
    <div data-chart-id={chart}>Chart: {chart}</div>
))

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: (props: any) => DashboardComponentMock(props),
}))

jest.mock('framer-motion', () => ({
    motion: {
        div: require('react').forwardRef(
            ({ children, ...props }: any, ref: any) => (
                <div
                    ref={ref}
                    data-initial={JSON.stringify(props.initial)}
                    data-animate={JSON.stringify(props.animate)}
                    className={props.className}
                >
                    {children}
                </div>
            ),
        ),
    },
}))

const reportConfigMock = {
    charts: {
        kpi1: { chartComponent: () => null, label: 'KPI 1' },
        kpi2: { chartComponent: () => null, label: 'KPI 2' },
        kpi3: { chartComponent: () => null, label: 'KPI 3' },
        kpi4: { chartComponent: () => null, label: 'KPI 4' },
        kpi5: { chartComponent: () => null, label: 'KPI 5' },
    },
} as any

const makeItem = (chartId: string): LayoutItem =>
    ({
        chartId: chartId as AnalyticsChartType,
        gridSize: 3,
        visibility: true,
    }) as LayoutItem

describe('KpiItemAnimated', () => {
    beforeEach(() => {
        DashboardComponentMock.mockClear()
    })

    it('should render DashboardComponent with the correct chart', () => {
        render(
            <AnimatedTrendCard
                item={makeItem('kpi1')}
                index={0}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        expect(DashboardComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({ chart: 'kpi1' }),
        )
    })

    it('should apply entrance animation from the left for index 0', () => {
        const { container } = render(
            <AnimatedTrendCard
                item={makeItem('kpi1')}
                index={0}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        const div = container.firstChild as HTMLElement
        const initial = JSON.parse(div.getAttribute('data-initial') ?? '{}')
        expect(initial.x).toBe(-50)
        expect(initial.y).toBe(-30)
        expect(initial.opacity).toBe(0)

        const animate = JSON.parse(div.getAttribute('data-animate') ?? '{}')
        expect(animate.x).toBe(0)
        expect(animate.y).toBe(0)
        expect(animate.opacity).toBe(1)
    })

    it('should apply entrance animation for index 1', () => {
        const { container } = render(
            <AnimatedTrendCard
                item={makeItem('kpi2')}
                index={1}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        const div = container.firstChild as HTMLElement
        const initial = JSON.parse(div.getAttribute('data-initial') ?? '{}')
        expect(initial.x).toBe(-25)
        expect(initial.y).toBe(-20)
    })

    it('should apply entrance animation for index 2', () => {
        const { container } = render(
            <AnimatedTrendCard
                item={makeItem('kpi3')}
                index={2}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        const div = container.firstChild as HTMLElement
        const initial = JSON.parse(div.getAttribute('data-initial') ?? '{}')
        expect(initial.x).toBe(50)
        expect(initial.y).toBe(-30)
    })

    it('should apply entrance animation for index 3', () => {
        const { container } = render(
            <AnimatedTrendCard
                item={makeItem('kpi4')}
                index={3}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        const div = container.firstChild as HTMLElement
        const initial = JSON.parse(div.getAttribute('data-initial') ?? '{}')
        expect(initial.x).toBe(25)
        expect(initial.y).toBe(-20)
    })

    it('should cycle animations back to index 0 pattern for index 4', () => {
        const { container } = render(
            <AnimatedTrendCard
                item={makeItem('kpi5')}
                index={4}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        const div = container.firstChild as HTMLElement
        const initial = JSON.parse(div.getAttribute('data-initial') ?? '{}')
        expect(initial.x).toBe(-50)
        expect(initial.y).toBe(-30)
    })

    it('should pass reportConfig to DashboardComponent', () => {
        render(
            <AnimatedTrendCard
                item={makeItem('kpi1')}
                index={0}
                tabKey={undefined}
                reportConfig={reportConfigMock}
            />,
        )

        expect(DashboardComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({ config: reportConfigMock }),
        )
    })
})
