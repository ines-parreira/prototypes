import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'

import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import { DragAndResizeDashboardGrid } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeDashboardGrid'
import type {
    DashboardChartSchema,
    DashboardRowSchema,
    DashboardSchema,
    DashboardSectionSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'

let capturedOnLayoutChange: ((layout: any) => void) | null = null
let capturedOnDragStop: ((layout: any) => void) | null = null
let capturedOnResizeStop: ((layout: any) => void) | null = null
let capturedOnBreakpointChange:
    | ((breakpoint: string, cols: number) => void)
    | null = null
let capturedResizeConfig: any = null
let capturedDragConfig: any = null

jest.mock('react-grid-layout', () => {
    const MockResponsiveGridLayout = ({
        children,
        width,
        breakpoints,
        cols,
        rowHeight,
        dragConfig,
        resizeConfig,
        containerPadding,
        compactor,
        layouts,
        onLayoutChange,
        onDragStop,
        onResizeStop,
        onBreakpointChange,
    }: any) => {
        capturedOnLayoutChange = onLayoutChange
        capturedOnDragStop = onDragStop
        capturedOnResizeStop = onResizeStop
        capturedOnBreakpointChange = onBreakpointChange
        capturedResizeConfig = resizeConfig
        capturedDragConfig = dragConfig

        const layout = layouts?.lg || []

        const processedChildren = React.Children.map(
            children,
            (child, index) => {
                if (!React.isValidElement(child)) return child

                const layoutItem = layout[index]
                if (!layoutItem) return child

                return React.cloneElement(child as React.ReactElement<any>, {
                    'data-grid': JSON.stringify(layoutItem),
                })
            },
        )

        return (
            <section
                role="grid"
                aria-label="Dashboard Grid Layout"
                data-width={width}
                data-breakpoints={JSON.stringify(breakpoints)}
                data-cols={JSON.stringify(cols)}
                data-row-height={rowHeight}
                data-is-draggable={dragConfig?.enabled}
                data-is-resizable={resizeConfig?.enabled}
                data-compact-type={String(compactor)}
                data-container-padding={JSON.stringify(containerPadding)}
            >
                {processedChildren}
            </section>
        )
    }
    MockResponsiveGridLayout.displayName = 'ResponsiveGridLayout'

    return {
        ResponsiveGridLayout: MockResponsiveGridLayout,
        useContainerWidth: jest.fn(() => ({
            width: 1200,
            mounted: true,
            containerRef: { current: null },
            measureWidth: jest.fn(),
        })),
        noCompactor: jest.fn(),
        verticalCompactor: jest.fn(),
    }
})

jest.mock(
    'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart',
    () => ({
        DragAndResizeChart: jest.fn(),
    }),
)
const DragAndResizeChartMock = assumeMock(DragAndResizeChart)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions', () => ({
    useDashboardActions: jest.fn(() => ({
        updateDashboardHandler: jest.fn(),
        isUpdateMutationLoading: false,
        isUpdateMutationError: false,
    })),
}))

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
        expect(gridLayout).toHaveAttribute('data-width', '1200')
        expect(gridLayout).toHaveAttribute('data-is-draggable', 'true')
        expect(gridLayout).toHaveAttribute('data-is-resizable', 'true')
        expect(gridLayout).toHaveAttribute('data-compact-type')
        expect(gridLayout).toHaveAttribute('data-row-height', '20')
        expect(gridLayout).toHaveAttribute(
            'data-cols',
            '{"lg":12,"md":8,"sm":6,"xs":4,"xxs":2}',
        )
        expect(gridLayout).toHaveAttribute('data-container-padding', '[24,24]')
        expect(gridLayout).toHaveAttribute(
            'data-breakpoints',
            '{"lg":1200,"md":996,"sm":768,"xs":480,"xxs":0}',
        )
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

    it('renders loading state before container width is mounted', () => {
        const { useContainerWidth } = jest.requireMock('react-grid-layout')
        useContainerWidth.mockReturnValueOnce({
            width: 0,
            mounted: false,
            containerRef: { current: null },
            measureWidth: jest.fn(),
        })

        const dashboard = createMockDashboard([])
        const { container } = render(
            <DragAndResizeDashboardGrid dashboard={dashboard} />,
        )

        const loadingDiv = container.querySelector('div[style*="width: 100%"]')
        expect(loadingDiv).toBeInTheDocument()

        const gridLayout = screen.queryByRole('grid', {
            name: /dashboard grid layout/i,
        })
        expect(gridLayout).not.toBeInTheDocument()
    })

    describe('Layout Persistence', () => {
        it('uses saved layout metadata when available', () => {
            const chartWithLayout: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'saved_chart',
                metadata: {
                    layout: {
                        x: 6,
                        y: 10,
                        w: 6,
                        h: 12,
                    },
                },
            }

            const dashboard = createMockDashboard([chartWithLayout])
            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const gridElement = screen.getByRole('grid')
            const chartElement = gridElement.querySelector(
                '[data-grid]',
            ) as HTMLElement

            expect(chartElement).toBeInTheDocument()
            expect(chartElement.getAttribute('data-grid')).toContain('"x":6')
            expect(chartElement.getAttribute('data-grid')).toContain('"y":10')
            expect(chartElement.getAttribute('data-grid')).toContain('"w":6')
            expect(chartElement.getAttribute('data-grid')).toContain('"h":12')
        })

        it('calculates layout for charts without metadata', () => {
            const chartWithoutLayout = createMockChart('new_chart')

            const dashboard = createMockDashboard([chartWithoutLayout])
            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const gridElement = screen.getByRole('grid')
            const chartElement = gridElement.querySelector(
                '[data-grid]',
            ) as HTMLElement

            expect(chartElement).toBeInTheDocument()
            expect(chartElement.getAttribute('data-grid')).toContain('"x":0')
            expect(chartElement.getAttribute('data-grid')).toContain('"y":0')
        })

        it('handles mixed charts with and without saved layouts', () => {
            const chartWithLayout: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'saved_chart',
                metadata: {
                    layout: {
                        x: 3,
                        y: 2,
                        w: 6,
                        h: 20,
                    },
                },
            }
            const chartWithoutLayout = createMockChart('new_chart')

            const dashboard = createMockDashboard([
                chartWithLayout,
                chartWithoutLayout,
            ])
            const { container } = render(
                <DragAndResizeDashboardGrid dashboard={dashboard} />,
            )

            const chartElements = container.querySelectorAll('[data-grid]')
            expect(chartElements).toHaveLength(2)
        })

        it('clamps saved layout to respect constraints', () => {
            const chartWithInvalidLayout: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'invalid_chart',
                metadata: {
                    layout: {
                        x: 10,
                        y: 5,
                        w: 10,
                        h: 25,
                    },
                },
            }

            const dashboard = createMockDashboard([chartWithInvalidLayout])
            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const gridElement = screen.getByRole('grid')
            const chartElement = gridElement.querySelector(
                '[data-grid]',
            ) as HTMLElement

            expect(chartElement).toBeInTheDocument()
            expect(chartElement.getAttribute('data-grid')).toContain('"w":6')
            expect(chartElement.getAttribute('data-grid')).toContain('"h":16')
        })
    })

    describe('handleLayoutChange', () => {
        beforeEach(() => {
            capturedOnLayoutChange = null
            capturedOnDragStop = null
            capturedOnResizeStop = null
            capturedOnBreakpointChange = null
        })

        it('should skip update on initial mount', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 1, y: 1, w: 2, h: 9 },
                ])
            }

            expect(mockUpdateDashboardHandler).not.toHaveBeenCalled()
        })

        it('should update dashboard with new layout metadata on drag stop', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart1 = createMockChart('chart-1')
            const chart2 = createMockChart('chart-2')
            const dashboard = createMockDashboard([chart1, chart2])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                    { i: 'chart-2', x: 1, y: 0, w: 1, h: 3 },
                ])
            }

            if (capturedOnDragStop) {
                capturedOnDragStop([
                    { i: 'chart-1', x: 2, y: 1, w: 2, h: 9 },
                    { i: 'chart-2', x: 0, y: 1, w: 2, h: 9 },
                ])
            }

            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: null,
                    emoji: null,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-1',
                            metadata: {
                                layout: {
                                    x: 2,
                                    y: 1,
                                    w: 2,
                                    h: 9,
                                },
                            },
                        },
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-2',
                            metadata: {
                                layout: {
                                    x: 0,
                                    y: 1,
                                    w: 2,
                                    h: 9,
                                },
                            },
                        },
                    ],
                },
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        })

        it('should update dashboard with new layout metadata on resize stop', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart1 = createMockChart('chart-1')
            const chart2 = createMockChart('chart-2')
            const dashboard = createMockDashboard([chart1, chart2])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                    { i: 'chart-2', x: 1, y: 0, w: 1, h: 3 },
                ])
            }

            if (capturedOnResizeStop) {
                capturedOnResizeStop([
                    { i: 'chart-1', x: 0, y: 0, w: 2, h: 6 },
                    { i: 'chart-2', x: 2, y: 0, w: 2, h: 6 },
                ])
            }

            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: null,
                    emoji: null,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-1',
                            metadata: {
                                layout: {
                                    x: 0,
                                    y: 0,
                                    w: 2,
                                    h: 6,
                                },
                            },
                        },
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-2',
                            metadata: {
                                layout: {
                                    x: 2,
                                    y: 0,
                                    w: 2,
                                    h: 6,
                                },
                            },
                        },
                    ],
                },
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        })

        it('should preserve chart without matching layout metadata', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart1 = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart1])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                ])
            }

            if (capturedOnResizeStop) {
                capturedOnResizeStop([
                    { i: 'different-chart', x: 1, y: 1, w: 2, h: 9 },
                ])
            }

            expect(mockUpdateDashboardHandler).toHaveBeenLastCalledWith({
                dashboard: {
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: null,
                    emoji: null,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-1',
                        },
                    ],
                },
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        })

        it('should handle nested row children when updating layout', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart1 = createMockChart('chart-1')
            const chart2 = createMockChart('chart-2')
            const row = createMockRow([chart1, chart2])
            const dashboard = createMockDashboard([row])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                    { i: 'chart-2', x: 1, y: 0, w: 1, h: 3 },
                ])
            }

            if (capturedOnResizeStop) {
                capturedOnResizeStop([
                    { i: 'chart-1', x: 2, y: 1, w: 2, h: 9 },
                    { i: 'chart-2', x: 0, y: 1, w: 2, h: 9 },
                ])
            }

            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: null,
                    emoji: null,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [
                                {
                                    type: DashboardChildType.Chart,
                                    config_id: 'chart-1',
                                    metadata: {
                                        layout: {
                                            x: 2,
                                            y: 1,
                                            w: 2,
                                            h: 9,
                                        },
                                    },
                                },
                                {
                                    type: DashboardChildType.Chart,
                                    config_id: 'chart-2',
                                    metadata: {
                                        layout: {
                                            x: 0,
                                            y: 1,
                                            w: 2,
                                            h: 9,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        })

        it('should handle nested section children when updating layout', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart1 = createMockChart('chart-1')
            const chart2 = createMockChart('chart-2')
            const row = createMockRow([chart1])
            const section = createMockSection([row, chart2])
            const dashboard = createMockDashboard([section])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                    { i: 'chart-2', x: 1, y: 0, w: 1, h: 3 },
                ])
            }

            if (capturedOnDragStop) {
                capturedOnDragStop([
                    { i: 'chart-1', x: 1, y: 2, w: 2, h: 9 },
                    { i: 'chart-2', x: 0, y: 2, w: 1, h: 6 },
                ])
            }

            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: null,
                    emoji: null,
                    children: [
                        {
                            type: DashboardChildType.Section,
                            children: [
                                {
                                    type: DashboardChildType.Row,
                                    children: [
                                        {
                                            type: DashboardChildType.Chart,
                                            config_id: 'chart-1',
                                            metadata: {
                                                layout: {
                                                    x: 1,
                                                    y: 2,
                                                    w: 2,
                                                    h: 9,
                                                },
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: DashboardChildType.Chart,
                                    config_id: 'chart-2',
                                    metadata: {
                                        layout: {
                                            x: 0,
                                            y: 2,
                                            w: 1,
                                            h: 6,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        })
    })

    describe('Responsive Breakpoint Behavior', () => {
        beforeEach(() => {
            capturedOnLayoutChange = null
            capturedOnDragStop = null
            capturedOnResizeStop = null
            capturedOnBreakpointChange = null
        })

        it('should track breakpoint changes', () => {
            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const gridLayout = screen.getByRole('grid', {
                name: /dashboard grid layout/i,
            })
            expect(gridLayout).toHaveAttribute('data-is-draggable', 'true')
            expect(gridLayout).toHaveAttribute('data-is-resizable', 'true')

            act(() => {
                if (capturedOnBreakpointChange) {
                    capturedOnBreakpointChange('md', 8)
                }
            })

            const updatedGridLayout = screen.getByRole('grid', {
                name: /dashboard grid layout/i,
            })
            expect(updatedGridLayout).toHaveAttribute(
                'data-is-draggable',
                'false',
            )
            expect(updatedGridLayout).toHaveAttribute(
                'data-is-resizable',
                'false',
            )
        })

        it('should prevent saves on non-lg breakpoint drag', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                ])
            }

            act(() => {
                if (capturedOnBreakpointChange) {
                    capturedOnBreakpointChange('md', 8)
                }
            })

            if (capturedOnDragStop) {
                capturedOnDragStop([{ i: 'chart-1', x: 2, y: 1, w: 2, h: 9 }])
            }

            expect(mockUpdateDashboardHandler).not.toHaveBeenCalled()
        })

        it('should prevent saves on non-lg breakpoint resize', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                ])
            }

            act(() => {
                if (capturedOnBreakpointChange) {
                    capturedOnBreakpointChange('sm', 6)
                }
            })

            if (capturedOnResizeStop) {
                capturedOnResizeStop([
                    { i: 'chart-1', x: 0, y: 0, w: 3, h: 12 },
                ])
            }

            expect(mockUpdateDashboardHandler).not.toHaveBeenCalled()
        })

        it('should allow saves on lg breakpoint drag', () => {
            const mockUpdateDashboardHandler = jest.fn()
            const { useDashboardActions } = jest.requireMock(
                'domains/reporting/hooks/dashboards/useDashboardActions',
            )
            useDashboardActions.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
                isUpdateMutationError: false,
            })

            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            if (capturedOnLayoutChange) {
                capturedOnLayoutChange([
                    { i: 'chart-1', x: 0, y: 0, w: 1, h: 3 },
                ])
            }

            act(() => {
                if (capturedOnBreakpointChange) {
                    capturedOnBreakpointChange('lg', 12)
                }
            })

            if (capturedOnDragStop) {
                capturedOnDragStop([{ i: 'chart-1', x: 2, y: 1, w: 2, h: 9 }])
            }

            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: null,
                    emoji: null,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-1',
                            metadata: {
                                layout: {
                                    x: 2,
                                    y: 1,
                                    w: 2,
                                    h: 9,
                                },
                            },
                        },
                    ],
                },
                successMessage: 'Dashboard layout saved',
                errorMessage: 'Failed to save dashboard layout',
            })
        })

        it('should disable drag and resize on mobile breakpoints', () => {
            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            act(() => {
                if (capturedOnBreakpointChange) {
                    capturedOnBreakpointChange('xs', 4)
                }
            })

            const gridLayout = screen.getByRole('grid', {
                name: /dashboard grid layout/i,
            })
            expect(gridLayout).toHaveAttribute('data-is-draggable', 'false')
            expect(gridLayout).toHaveAttribute('data-is-resizable', 'false')
        })
    })

    describe('Mixed layout state handling', () => {
        it('should preserve existing layouts when adding new chart without layout', () => {
            const chartWithLayout: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'chart-with-layout',
                metadata: {
                    layout: {
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 9,
                    },
                },
            }

            const chartWithoutLayout = createMockChart('chart-without-layout')

            const dashboard = createMockDashboard([
                createMockRow([chartWithLayout, chartWithoutLayout]),
            ])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const chart1Element = screen.getByRole('img', {
                name: /chart chart-with-layout/i,
            })
            const chart1Grid = JSON.parse(
                chart1Element.parentElement!.getAttribute('data-grid')!,
            )

            expect(chart1Grid).toMatchObject({ x: 0, y: 0, w: 3, h: 9 })

            const chart2Element = screen.getByRole('img', {
                name: /chart chart-without-layout/i,
            })
            const chart2Grid = JSON.parse(
                chart2Element.parentElement!.getAttribute('data-grid')!,
            )

            expect(chart2Grid.x).toBeGreaterThanOrEqual(3)
        })

        it('should handle all charts having layouts', () => {
            const chart1: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'chart-1',
                metadata: {
                    layout: {
                        x: 0,
                        y: 0,
                        w: 3,
                        h: 4,
                    },
                },
            }

            const chart2: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'chart-2',
                metadata: {
                    layout: {
                        x: 3,
                        y: 0,
                        w: 3,
                        h: 9,
                    },
                },
            }

            const dashboard = createMockDashboard([
                createMockRow([chart1, chart2]),
            ])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const chart1Element = screen.getByRole('img', {
                name: /chart chart-1/i,
            })
            const chart1Grid = JSON.parse(
                chart1Element.parentElement!.getAttribute('data-grid')!,
            )
            expect(chart1Grid).toMatchObject({ x: 0, y: 0, w: 3, h: 4 })

            const chart2Element = screen.getByRole('img', {
                name: /chart chart-2/i,
            })
            const chart2Grid = JSON.parse(
                chart2Element.parentElement!.getAttribute('data-grid')!,
            )
            expect(chart2Grid).toMatchObject({ x: 3, y: 0, w: 3, h: 9 })
        })

        it('should clamp invalid saved layouts to constraints', () => {
            const chart: DashboardChartSchema = {
                type: DashboardChildType.Chart,
                config_id: 'chart-1',
                metadata: {
                    layout: {
                        x: 20,
                        y: 0,
                        w: 100,
                        h: 100,
                    },
                },
            }

            const dashboard = createMockDashboard([createMockRow([chart])])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            const chartElement = screen.getByRole('img', {
                name: /chart chart-1/i,
            })
            const chartGrid = JSON.parse(
                chartElement.parentElement!.getAttribute('data-grid')!,
            )

            expect(chartGrid.x).toBeLessThanOrEqual(12)
            expect(chartGrid.w).toBeLessThanOrEqual(chartGrid.maxW)
            expect(chartGrid.h).toBeLessThanOrEqual(chartGrid.maxH)
        })
    })

    describe('Custom Resize Handle', () => {
        beforeEach(() => {
            capturedResizeConfig = null
        })

        it('should configure resize handles as southeast only', () => {
            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            expect(capturedResizeConfig).toBeDefined()
            expect(capturedResizeConfig?.enabled).toBe(true)
            expect(capturedResizeConfig?.handles).toEqual(['se'])
        })

        it('should not provide custom handle component (uses default handle styled with CSS)', () => {
            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            expect(capturedResizeConfig).toBeDefined()
            // We use the default handle styled with CSS, not a custom React component
            expect(capturedResizeConfig?.handleComponent).toBeUndefined()
        })
    })

    describe('Drag Handle', () => {
        beforeEach(() => {
            capturedDragConfig = null
        })

        it('should configure drag handle to restrict drag to .drag-handle elements', () => {
            const chart = createMockChart('chart-1')
            const dashboard = createMockDashboard([chart])

            render(<DragAndResizeDashboardGrid dashboard={dashboard} />)

            expect(capturedDragConfig).toBeDefined()
            expect(capturedDragConfig?.handle).toBe('.drag-handle')
        })

        it('should render a drag handle element for each chart in the grid', () => {
            const chart1 = createMockChart('chart-1')
            const chart2 = createMockChart('chart-2')
            const dashboard = createMockDashboard([chart1, chart2])

            const { container } = render(
                <DragAndResizeDashboardGrid dashboard={dashboard} />,
            )

            const dragHandles = container.querySelectorAll('.drag-handle')
            expect(dragHandles).toHaveLength(2)
            dragHandles.forEach((handle) => {
                expect(handle).toHaveAttribute('aria-hidden', 'true')
            })
        })

        it('should render drag handle for charts in nested rows and sections', () => {
            const chart1 = createMockChart('chart-1')
            const chart2 = createMockChart('chart-2')
            const row = createMockRow([chart1, chart2])
            const dashboard = createMockDashboard([row])

            const { container } = render(
                <DragAndResizeDashboardGrid dashboard={dashboard} />,
            )

            const dragHandles = container.querySelectorAll('.drag-handle')
            expect(dragHandles).toHaveLength(2)
        })
    })
})
