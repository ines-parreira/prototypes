import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { act, render, waitFor } from '@testing-library/react'
import { DragSourceMonitor, DropTargetMonitor, useDragLayer } from 'react-dnd'

import {
    createDragItem,
    createDropzoneHoverHandler,
    createIsDragging,
    createMoveHandler,
    createMoveRawHandler,
    DraggableGridCell,
    DraggablePreview,
    MeasureRect,
    useMeasure,
} from 'domains/reporting/pages/dashboards/DraggableGridCell'
import {
    DashboardChartSchema,
    DashboardChild,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'

const dummyRect = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
}

jest.mock('react-dnd', () => ({
    useDragLayer: jest.fn(),
    useDrag: jest.fn(),
    useDrop: jest.fn(),
}))

jest.mock('react-dnd-html5-backend', () => ({
    getEmptyImage: jest.fn(() => ({})),
}))

jest.mock('hooks/useId', () => () => 'mock-id')

jest.mock('domains/reporting/pages/common/layout/DashboardGrid', () => 'div')
jest.mock(
    'domains/reporting/pages/common/layout/DashboardGridCell',
    () => 'div',
)
jest.mock('pages/common/forms/input/IconInput', () => 'span')
jest.mock('@gorgias/merchant-ui-kit', () => ({
    Tooltip: 'div',
}))

const mockUseDragLayer = assumeMock(useDragLayer)
const mockUseDrag = assumeMock(require('react-dnd').useDrag)
const mockUseDrop = assumeMock(require('react-dnd').useDrop)

const createDummyDragItem = ({
    configId = '1',
    size = 2,
    rect = dummyRect,
    element = <div />,
}: {
    configId?: string
    size?: number
    rect?: MeasureRect
    element?: React.ReactNode
} = {}) =>
    createDragItem({
        size,
        schema: {
            config_id: configId,
            type: DashboardChildType.Chart,
        },
        element,
        rect,
    })

describe('createMoveHandler(node, target, handleMove)', () => {
    const mockFindChartIndex = jest.fn()
    let node: HTMLElement

    beforeEach(() => {
        node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect,
        )
        mockFindChartIndex.mockClear()
    })

    it('returns a function', () => {
        const item = createDummyDragItem()
        const onMove = jest.fn()

        const actual = createMoveHandler(node, item, onMove, mockFindChartIndex)

        expect(typeof actual).toBe('function')
    })

    it('does nothing if node is null', () => {
        const targetItem = createDummyDragItem({ configId: '1' })
        const srcItem = createDummyDragItem({ configId: '2' })
        const monitor = {
            getClientOffset: () => ({ x: 0, y: 0 }),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(
            null,
            targetItem,
            onMove,
            mockFindChartIndex,
        )

        handleMove(srcItem, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    it('does nothing if hovering over itself', () => {
        const item = createDummyDragItem({ configId: '1', size: 2 })
        const monitor = {
            getClientOffset: () => ({ x: 0, y: 0 }),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(
            node,
            item,
            onMove,
            mockFindChartIndex,
        )

        handleMove(item, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    it('does nothing if not past the hover threshold', () => {
        const targetItem = createDummyDragItem({ configId: '1', size: 4 })
        const srcItem = createDummyDragItem({ configId: '2', size: 2 })
        const monitor = {
            getClientOffset: () => ({ x: 50, y: 50 }),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(
            node,
            targetItem,
            onMove,
            mockFindChartIndex,
        )

        handleMove(srcItem, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    describe('when target is smaller or equal size', () => {
        it('positions before when source index is higher', () => {
            const targetId = '1'
            const srcId = '2'
            mockFindChartIndex.mockImplementation((id) =>
                id === srcId ? 1 : 0,
            )

            const targetItem = createDummyDragItem({
                configId: targetId,
                size: 2,
            })
            const srcItem = createDummyDragItem({
                configId: srcId,
                size: 2,
            })
            const monitor = {
                getClientOffset: () => ({ x: 50, y: 50 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'before')
        })

        it('positions after when source index is lower', () => {
            const targetId = '1'
            const srcId = '2'
            mockFindChartIndex.mockImplementation((id) =>
                id === srcId ? 0 : 1,
            )

            const targetItem = createDummyDragItem({
                configId: targetId,
                size: 2,
            })
            const srcItem = createDummyDragItem({
                configId: srcId,
                size: 2,
            })
            const monitor = {
                getClientOffset: () => ({ x: 50, y: 50 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'after')
        })
    })

    describe('when target is full width (size 12)', () => {
        it('positions before when hovering above middle', () => {
            const targetItem = createDummyDragItem({ configId: '1', size: 12 })
            const srcItem = createDummyDragItem({ configId: '2', size: 2 })
            const monitor = {
                getClientOffset: () => ({ x: 0, y: 30 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith('2', '1', 'before')
        })

        it('positions after when hovering below middle', () => {
            const targetItem = createDummyDragItem({ configId: '1', size: 12 })
            const srcItem = createDummyDragItem({ configId: '2', size: 2 })
            const monitor = {
                getClientOffset: () => ({ x: 0, y: 70 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith('2', '1', 'after')
        })
    })

    describe('when target is larger but not full width', () => {
        it('positions before when hovering in top-left quadrant', () => {
            const targetItem = createDummyDragItem({ configId: '1', size: 6 })
            const srcItem = createDummyDragItem({ configId: '2', size: 2 })
            const monitor = {
                getClientOffset: () => ({ x: 20, y: 20 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith('2', '1', 'before')
        })

        it('positions after when hovering in bottom-right quadrant', () => {
            const targetItem = createDummyDragItem({ configId: '1', size: 6 })
            const srcItem = createDummyDragItem({ configId: '2', size: 2 })
            const monitor = {
                getClientOffset: () => ({ x: 80, y: 80 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith('2', '1', 'after')
        })

        it('positions after when hovering in top-right quadrant', () => {
            const targetItem = createDummyDragItem({ configId: '1', size: 6 })
            const srcItem = createDummyDragItem({ configId: '2', size: 2 })
            const monitor = {
                getClientOffset: () => ({ x: 80, y: 20 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith('2', '1', 'after')
        })

        it('positions after when hovering in bottom-left quadrant', () => {
            const targetItem = createDummyDragItem({ configId: '1', size: 6 })
            const srcItem = createDummyDragItem({ configId: '2', size: 2 })
            const monitor = {
                getClientOffset: () => ({ x: 20, y: 80 }),
            } as DropTargetMonitor
            const onMove = jest.fn()

            const handleMove = createMoveHandler(
                node,
                targetItem,
                onMove,
                mockFindChartIndex,
            )
            handleMove(srcItem, monitor)

            expect(onMove).toHaveBeenCalledWith('2', '1', 'after')
        })
    })
})

describe('DraggablePreview', () => {
    it('returns null when not dragging', () => {
        mockUseDragLayer.mockReturnValue({
            isDragging: false,
            currentOffset: null,
            item: null,
        })

        const { container } = render(<DraggablePreview />)
        expect(container.firstChild).toBeNull()
    })

    it('returns null when no currentOffset', () => {
        mockUseDragLayer.mockReturnValue({
            isDragging: true,
            currentOffset: null,
            item: null,
        })

        const { container } = render(<DraggablePreview />)
        expect(container.firstChild).toBeNull()
    })

    it('renders preview with correct positioning', () => {
        const mockItem = createDummyDragItem({
            rect: {
                width: 200,
                height: 150,
            } as MeasureRect,
            element: <div>Mock Content</div>,
        })

        mockUseDragLayer.mockReturnValue({
            isDragging: true,
            currentOffset: { x: 100, y: 50 },
            item: mockItem,
        })

        const { container } = render(<DraggablePreview />)

        const previewDiv = container.firstChild as HTMLElement
        expect(previewDiv).toHaveClass('preview')
        expect(previewDiv.style.width).toBe('200px')
        expect(previewDiv.style.height).toBe('150px')

        // Check transform calculation
        // handleOffset.x = width/2 - HANDLE_WIDTH/2 = 200/2 - 40/2 = 80
        // x = currentOffset.x - handleOffset.x = 100 - 80 = 20
        // y = currentOffset.y - 0 = 50
        expect(previewDiv.style.transform).toBe('translate(20px, 50px)')
    })

    it('renders the provided element content', () => {
        const mockItem = createDummyDragItem({
            rect: {
                width: 200,
                height: 150,
            } as MeasureRect,
            element: <div data-testid="mock-content">Mock Content</div>,
        })

        mockUseDragLayer.mockReturnValue({
            isDragging: true,
            currentOffset: { x: 100, y: 50 },
            item: mockItem,
        })

        const { getByTestId } = render(<DraggablePreview />)
        expect(getByTestId('mock-content')).toBeInTheDocument()
    })
})

const defaultState = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
}

describe('useMeasure', () => {
    let mockObserve: jest.Mock
    let mockDisconnect: jest.Mock
    let mockResizeObserver: jest.Mock

    beforeEach(() => {
        mockObserve = jest.fn()
        mockDisconnect = jest.fn()
        mockResizeObserver = jest.fn((callback) => ({
            observe: mockObserve,
            disconnect: mockDisconnect,
            callback,
        }))
        window.ResizeObserver = mockResizeObserver
    })

    it('should return default state initially', () => {
        const ref = React.createRef<HTMLDivElement>()
        const { result } = renderHook(() => useMeasure(ref))

        expect(result.current).toEqual(defaultState)
    })

    it('should not set up ResizeObserver if ref is null', () => {
        const ref = React.createRef<HTMLDivElement>()
        renderHook(() => useMeasure(ref))

        expect(mockResizeObserver).not.toHaveBeenCalled()
        expect(mockObserve).not.toHaveBeenCalled()
    })

    it('should set up ResizeObserver when ref is available', () => {
        const ref = { current: document.createElement('div') }
        renderHook(() => useMeasure(ref))

        expect(mockResizeObserver).toHaveBeenCalled()
        expect(mockObserve).toHaveBeenCalledWith(ref.current)
    })

    it('should update measurements when ResizeObserver fires', async () => {
        const ref = { current: document.createElement('div') }
        const { result } = renderHook(() => useMeasure(ref))

        const contentRect = {
            x: 10,
            y: 20,
            width: 200,
            height: 100,
            top: 20,
            left: 10,
            bottom: 120,
            right: 210,
            toJSON: () => {
                const { toJSON: __toJSON, ...rest } = contentRect
                return rest
            },
        }

        act(() => {
            const [[callback]] = mockResizeObserver.mock.calls as [
                [ResizeObserverCallback],
            ]
            callback(
                [{ contentRect } as ResizeObserverEntry],
                mockResizeObserver as unknown as ResizeObserver,
            )
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                x: 10,
                y: 20,
                width: 200,
                height: 100,
                top: 20,
                left: 10,
                bottom: 120,
                right: 210,
            })
        })
    })

    it('should clean up ResizeObserver on unmount', () => {
        const ref = { current: document.createElement('div') }
        const { unmount } = renderHook(() => useMeasure(ref))

        unmount()

        expect(mockDisconnect).toHaveBeenCalled()
    })
})

describe('createIsDragging', () => {
    it('returns true when dragging item has matching config_id', () => {
        const item = createDummyDragItem({ configId: 'test-123', size: 2 })

        const monitor = {
            getItem: () => item,
        } as DragSourceMonitor

        const isDragging = createIsDragging(item)(monitor)

        expect(isDragging).toBe(true)
    })

    it('returns false when dragging item has different config_id', () => {
        const item = createDummyDragItem({ configId: 'test-123', size: 2 })

        const monitor = {
            getItem: () => ({
                config_id: 'different-id',
            }),
        } as DragSourceMonitor

        const isDragging = createIsDragging(item)(monitor)

        expect(isDragging).toBe(false)
    })
})

describe('createDropzoneHoverHandler', () => {
    const mockMoveHandler = jest.fn()

    it('returns a function', () => {
        const schemas: DashboardChild[] = []

        const actual = createDropzoneHoverHandler(schemas, mockMoveHandler)

        expect(typeof actual).toBe('function')
    })

    it('does nothing if no chart is found', () => {
        const schemas = [
            {
                type: DashboardChildType.Section,
                children: [],
            },
        ] as DashboardChild[]
        const item = createDummyDragItem({ configId: 'test-id' })

        const handler = createDropzoneHoverHandler(schemas, mockMoveHandler)
        handler(item)

        expect(mockMoveHandler).not.toHaveBeenCalled()
    })

    it('does nothing if dragged item is the same as first chart', () => {
        const firstChartId = 'chart-1'
        const schemas = [
            {
                type: DashboardChildType.Chart,
                config_id: firstChartId,
            },
        ] as DashboardChild[]
        const item = createDummyDragItem({ configId: firstChartId })

        const handler = createDropzoneHoverHandler(schemas, mockMoveHandler)
        handler(item)

        expect(mockMoveHandler).not.toHaveBeenCalled()
    })

    it('moves chart before first chart when different charts', () => {
        const firstChartId = 'chart-1'
        const draggedChartId = 'chart-2'
        const schemas = [
            {
                type: DashboardChildType.Chart,
                config_id: firstChartId,
            },
        ] as DashboardChild[]
        const item = createDummyDragItem({ configId: draggedChartId })

        const handler = createDropzoneHoverHandler(schemas, mockMoveHandler)
        handler(item)

        expect(mockMoveHandler).toHaveBeenCalledWith(
            draggedChartId,
            firstChartId,
            'before',
        )
    })

    it('finds first chart in nested structure', () => {
        const firstChartId = 'chart-1'
        const draggedChartId = 'chart-2'
        const schemas = [
            {
                type: DashboardChildType.Section,
                children: [
                    {
                        type: DashboardChildType.Row,
                        children: [
                            {
                                type: DashboardChildType.Chart,
                                config_id: firstChartId,
                            },
                        ],
                    },
                ],
            },
        ] as DashboardChild[]
        const item = createDummyDragItem({ configId: draggedChartId })

        const handler = createDropzoneHoverHandler(schemas, mockMoveHandler)
        handler(item)

        expect(mockMoveHandler).toHaveBeenCalledWith(
            draggedChartId,
            firstChartId,
            'before',
        )
    })
})

describe('createMoveRawHandler', () => {
    const mockMoveHandler = jest.fn()

    beforeEach(() => {
        mockMoveHandler.mockClear()
    })

    it('returns a function', () => {
        const charts: DashboardChartSchema[] = []
        const actual = createMoveRawHandler(charts, mockMoveHandler)
        expect(typeof actual).toBe('function')
    })

    it('does nothing if dragged item is in the same row', () => {
        const charts = [
            { config_id: 'chart-1' },
            { config_id: 'chart-2' },
        ] as DashboardChartSchema[]

        const item = createDummyDragItem({ configId: 'chart-1' })
        const handler = createMoveRawHandler(charts, mockMoveHandler)

        handler(item)

        expect(mockMoveHandler).not.toHaveBeenCalled()
    })

    it('moves item after last chart when from different row', () => {
        const charts = [
            { config_id: 'chart-1' },
            { config_id: 'chart-2' },
        ] as DashboardChartSchema[]

        const item = createDummyDragItem({ configId: 'chart-3' })
        const handler = createMoveRawHandler(charts, mockMoveHandler)

        handler(item)

        expect(mockMoveHandler).toHaveBeenCalledWith(
            'chart-3',
            'chart-2',
            'after',
        )
    })

    it('works with single chart in row', () => {
        const charts = [{ config_id: 'chart-1' }] as DashboardChartSchema[]

        const item = createDummyDragItem({ configId: 'chart-2' })
        const handler = createMoveRawHandler(charts, mockMoveHandler)

        handler(item)

        expect(mockMoveHandler).toHaveBeenCalledWith(
            'chart-2',
            'chart-1',
            'after',
        )
    })
})

describe('<DraggableGridCell/>', () => {
    const mockOnMove = jest.fn()
    const mockOnDrop = jest.fn()
    const mockFindChartIndex = jest.fn()
    const mockSchema: DashboardChartSchema = {
        config_id: 'test-chart',
        type: DashboardChildType.Chart,
    }

    beforeEach(() => {
        mockOnMove.mockClear()
        mockOnDrop.mockClear()
        mockFindChartIndex.mockClear()

        // Mock useDrag to return the expected structure and capture the item function
        mockUseDrag.mockReturnValue([
            { isDragging: false },
            jest.fn(), // drag ref
            jest.fn(), // preview ref
        ])

        // Mock useDrop to return the expected structure
        mockUseDrop.mockReturnValue([
            {}, // collected props
            jest.fn(), // drop ref
        ])
    })

    it('should render DraggableGridCell', () => {
        const { container } = render(
            <DraggableGridCell
                size={4}
                schema={mockSchema}
                onMove={mockOnMove}
                onDrop={mockOnDrop}
                findChartIndex={mockFindChartIndex}
            >
                <div>Test Content</div>
            </DraggableGridCell>,
        )

        expect(container.firstChild).toBeInTheDocument()
    })

    it('should call useDrag with item function that returns the created item', () => {
        render(
            <DraggableGridCell
                size={4}
                schema={mockSchema}
                onMove={mockOnMove}
                onDrop={mockOnDrop}
                findChartIndex={mockFindChartIndex}
            >
                <div>Test Content</div>
            </DraggableGridCell>,
        )

        // Verify useDrag was called
        expect(mockUseDrag).toHaveBeenCalled()

        // Get the configuration passed to useDrag
        const useDragConfig = mockUseDrag.mock.calls[0][0]

        // Verify the item property is a function
        expect(typeof useDragConfig.item).toBe('function')

        // Call the item function and verify it returns the expected structure
        const itemResult = useDragConfig.item()
        expect(itemResult).toEqual(
            expect.objectContaining({
                config_id: 'test-chart',
                type: 'card', // createDragItem sets type to ChartType.Card
                size: 4,
                element: expect.any(Object),
                rect: expect.any(Object),
            }),
        )
    })

    it('should pass correct type to useDrag', () => {
        render(
            <DraggableGridCell
                size={4}
                schema={mockSchema}
                onMove={mockOnMove}
                onDrop={mockOnDrop}
                findChartIndex={mockFindChartIndex}
            >
                <div>Test Content</div>
            </DraggableGridCell>,
        )

        const useDragConfig = mockUseDrag.mock.calls[0][0]
        expect(useDragConfig.type).toBe('card')
    })
})
