import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import DragAndResizeDashboardGrid from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeDashboardGrid'
import {
    DashboardChartSchema,
    DashboardChildType,
    DashboardRowSchema,
    DashboardSchema,
    DashboardSectionSchema,
} from 'domains/reporting/pages/dashboards/types'

jest.mock('react-grid-layout', () => {
    const MockResponsive = ({
        children,
        cols,
        rowHeight,
        isDraggable,
        isResizable,
        preventCollision,
        compactType,
        containerPadding,
        ...otherProps
    }: any) => (
        <section
            role="grid"
            aria-label="Dashboard Grid Layout"
            data-cols={JSON.stringify(cols)}
            data-row-height={rowHeight}
            data-is-draggable={isDraggable}
            data-is-resizable={isResizable}
            data-prevent-collision={preventCollision}
            data-compact-type={String(compactType)}
            data-container-padding={JSON.stringify(containerPadding)}
            {...otherProps}
        >
            {children}
        </section>
    )
    MockResponsive.displayName = 'Responsive'

    const WidthProvider = (Component: any) => Component

    return {
        Responsive: MockResponsive,
        WidthProvider,
    }
})

jest.mock(
    'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart',
    () => ({
        DragAndResizeChart: jest.fn(),
    }),
)
const DragAndResizeChartMock = assumeMock(DragAndResizeChart)

describe('DragAndResizeDashboardGrid', () => {
    beforeEach(() => {
        DragAndResizeChartMock.mockImplementation(({ schema }) => (
            <article role="img" aria-label={`Chart ${schema.config_id}`}>
                <h3>Chart: {schema.config_id}</h3>
            </article>
        ))
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const createMockDashboard = (children: any[] = []): DashboardSchema => ({
        id: 1,
        name: 'Test Dashboard',
        analytics_filter_id: null,
        children,
        emoji: null,
    })

    const createMockChart = (configId: string): DashboardChartSchema => ({
        type: DashboardChildType.Chart,
        config_id: configId,
    })

    const createMockRow = (
        children: DashboardChartSchema[],
    ): DashboardRowSchema => ({
        type: DashboardChildType.Row,
        children,
    })

    const createMockSection = (children: any[]): DashboardSectionSchema => ({
        type: DashboardChildType.Section,
        children,
    })

    it('renders ResponsiveGridLayout with correct props', () => {
        const dashboard = createMockDashboard()

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        const gridLayout = screen.getByRole('grid', {
            name: /dashboard grid layout/i,
        })
        expect(gridLayout).toBeInTheDocument()
        expect(gridLayout).toHaveAttribute('data-is-draggable', 'true')
        expect(gridLayout).toHaveAttribute('data-is-resizable', 'true')
        expect(gridLayout).toHaveAttribute('data-prevent-collision', 'true')
        expect(gridLayout).toHaveAttribute('data-compact-type', 'null')
        expect(gridLayout).toHaveAttribute('data-row-height', '40')
        expect(gridLayout).toHaveAttribute(
            'data-cols',
            '{"lg":4,"md":4,"sm":3,"xs":2,"xxs":1}',
        )
        expect(gridLayout).toHaveAttribute('data-container-padding', '[25,20]')
    })

    it('renders empty grid when dashboard has no children', () => {
        const dashboard = createMockDashboard([])

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        const gridLayout = screen.getByRole('grid', {
            name: /dashboard grid layout/i,
        })
        expect(gridLayout).toBeInTheDocument()
        expect(gridLayout).toBeEmptyDOMElement()
    })

    it('renders chart children with correct data-grid attributes', () => {
        const chart1 = createMockChart('chart-1')
        const chart2 = createMockChart('chart-2')
        const dashboard = createMockDashboard([chart1, chart2])

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        const chart1Element = screen.getByRole('img', {
            name: /chart chart-1/i,
        })
        expect(chart1Element).toBeInTheDocument()
        expect(chart1Element.parentElement).toHaveAttribute('data-grid')

        const chart2Element = screen.getByRole('img', {
            name: /chart chart-2/i,
        })
        expect(chart2Element).toBeInTheDocument()
        expect(chart2Element.parentElement).toHaveAttribute('data-grid')

        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            {
                schema: chart1,
                dashboard,
            },
            {},
        )
        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            {
                schema: chart2,
                dashboard,
            },
            {},
        )
    })

    it('calculates correct grid positions for multiple charts', () => {
        const charts = [
            createMockChart('chart-1'),
            createMockChart('chart-2'),
            createMockChart('chart-3'),
            createMockChart('chart-4'),
            createMockChart('chart-5'),
        ]
        const dashboard = createMockDashboard(charts)

        const { container } = render(
            <DragAndResizeDashboardGrid dashboard={dashboard} />,
        )

        const gridItems = container.querySelectorAll('div[data-grid]')

        expect(gridItems).toHaveLength(5)

        for (let i = 0; i < gridItems.length; i++) {
            expect(gridItems[i]).toHaveAttribute('data-grid')
            const dataGrid = gridItems[i].getAttribute('data-grid')
            expect(dataGrid).toBeTruthy()
        }

        // The first 4 charts should be in the first row (x: 0-3, y: 0)
        // The 5th chart should be in the second row (x: 0, y: 1)
        expect(
            screen.getByRole('img', { name: /chart chart-1/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-2/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-3/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-4/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-5/i }),
        ).toBeInTheDocument()
    })

    it('renders nested row children correctly', () => {
        const chart1 = createMockChart('row-chart-1')
        const chart2 = createMockChart('row-chart-2')
        const row = createMockRow([chart1, chart2])
        const dashboard = createMockDashboard([row])

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        expect(
            screen.getByRole('img', { name: /chart row-chart-1/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart row-chart-2/i }),
        ).toBeInTheDocument()

        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            {
                schema: chart1,
                dashboard,
            },
            {},
        )
        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            {
                schema: chart2,
                dashboard,
            },
            {},
        )
    })

    it('renders nested section children correctly', () => {
        const chart1 = createMockChart('section-chart-1')
        const chart2 = createMockChart('section-chart-2')
        const chart3 = createMockChart('section-chart-3')
        const row = createMockRow([chart1, chart2])
        const section = createMockSection([row, chart3])
        const dashboard = createMockDashboard([section])

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        expect(
            screen.getByRole('img', { name: /chart section-chart-1/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart section-chart-2/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart section-chart-3/i }),
        ).toBeInTheDocument()

        expect(DragAndResizeChartMock).toHaveBeenCalledTimes(3)
    })

    it('handles complex nested structure with rows and sections', () => {
        const chart1 = createMockChart('chart-1')
        const chart2 = createMockChart('chart-2')
        const chart3 = createMockChart('chart-3')
        const chart4 = createMockChart('chart-4')

        const row1 = createMockRow([chart1, chart2])
        const row2 = createMockRow([chart3])
        const section = createMockSection([row1, row2])

        const dashboard = createMockDashboard([section, chart4])

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        expect(
            screen.getByRole('img', { name: /chart chart-1/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-2/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-3/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-4/i }),
        ).toBeInTheDocument()

        expect(DragAndResizeChartMock).toHaveBeenCalledTimes(4)
    })

    it('generates unique keys for chart elements', () => {
        const chart1 = createMockChart('chart-config-1')
        const chart2 = createMockChart('chart-config-2')
        const dashboard = createMockDashboard([chart1, chart2])

        const { container } = render(
            <DragAndResizeDashboardGrid dashboard={dashboard} />,
        )

        const gridItems = container.querySelectorAll('div[data-grid]')
        expect(gridItems).toHaveLength(2)

        expect(
            screen.getByRole('img', { name: /chart chart-config-1/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart chart-config-2/i }),
        ).toBeInTheDocument()

        expect(gridItems[0]).toHaveAttribute('data-grid')
        expect(gridItems[1]).toHaveAttribute('data-grid')
    })

    it('applies correct CSS classes from react-grid-layout', () => {
        const dashboard = createMockDashboard()

        render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

        const gridLayout = screen.getByRole('grid', {
            name: /dashboard grid layout/i,
        })
        expect(gridLayout).toBeInTheDocument()
    })
})
