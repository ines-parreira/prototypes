import {render, waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks'
import React from 'react'
import {DropTargetMonitor, useDragLayer} from 'react-dnd'

import {
    useMeasure,
    createDragItem,
    createMoveHandler,
    DraggablePreview,
} from 'pages/stats/custom-reports/DraggableGridCell'
import {CustomReportChildType} from 'pages/stats/custom-reports/types'
import {assumeMock} from 'utils/testing'

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

jest.mock('react-dnd', () => ({useDragLayer: jest.fn()}))
const mockUseDragLayer = assumeMock(useDragLayer)

describe('createMoveHandler(node, target, handleMove)', () => {
    const createDummyDragItem = (configId: string = '1', size: number = 2) =>
        createDragItem({
            size,
            schema: {
                config_id: configId,
                type: CustomReportChildType.Chart,
            },
            element: <div />,
            rect: dummyRect,
        })

    it('returns a function', () => {
        const node = document.createElement('div')
        const item = createDummyDragItem()
        const onMove = jest.fn()

        const actual = createMoveHandler(node, item, onMove)

        expect(typeof actual).toBe('function')
    })

    it('does nothing if node is null', () => {
        const targetItem = createDummyDragItem('1')
        const srcItem = createDummyDragItem('2')
        const monitor = {
            getClientOffset: () => ({x: 0, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(null, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    it('does nothing if hovering over itself', () => {
        const node = document.createElement('div')
        const item = createDummyDragItem('1', 2)
        const monitor = {
            getClientOffset: () => ({x: 0, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, item, onMove)

        handleMove(item, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    it('calls onMove if hovering over a card and moving it forward within the movement threshold on the X-axis', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetId = '1'
        const srcId = '2'

        const targetItem = createDummyDragItem(targetId, 2)
        const srcItem = createDummyDragItem(srcId, 2)
        const monitor = {
            getClientOffset: () => ({x: 40, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'before')
    })

    it('calls onMove if hovering over a card and moving it upwards within the movement threshold on the Y-axis', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetId = '1'
        const srcId = '2'

        const targetItem = createDummyDragItem(targetId, 2)
        const srcItem = createDummyDragItem(srcId, 2)
        const monitor = {
            getClientOffset: () => ({x: 0, y: 40}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'before')
    })

    it('calls onMove if hovering over a card and moving it backward within the movement threshold on the X-axis', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetId = '1'
        const srcId = '2'

        const targetItem = createDummyDragItem(targetId, 2)
        const srcItem = createDummyDragItem(srcId, 2)
        const monitor = {
            getClientOffset: () => ({x: 60, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'after')
    })

    it('calls onMove if hovering over a card and moving it downwards within the movement threshold on the Y-axis', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetId = '1'
        const srcId = '2'

        const targetItem = createDummyDragItem(targetId, 2)
        const srcItem = createDummyDragItem(srcId, 2)
        const monitor = {
            getClientOffset: () => ({x: 0, y: 80}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'after')
    })

    it('calls onMove if hovering over a big card and moving it forward within the vertical threshold', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetId = '1'
        const srcId = '2'

        const targetItem = createDummyDragItem(targetId, 12) // Big card
        const srcItem = createDummyDragItem(srcId, 2)
        const monitor = {
            getClientOffset: () => ({x: 0, y: 20}), // Over half vertically
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'before')
    })

    it('calls onMove if hovering over a big card and moving it backward within the vertical threshold', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetId = '1'
        const srcId = '2'

        const targetItem = createDummyDragItem(targetId, 12) // Big card
        const srcItem = createDummyDragItem(srcId, 2)
        const monitor = {
            getClientOffset: () => ({x: 0, y: 80}), // Over half vertically
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(srcId, targetId, 'after')
    })

    it('does not call onMove if not past the hover threshold', () => {
        const node = document.createElement('div')
        node.getBoundingClientRect = jest.fn(
            () =>
                ({
                    left: 0,
                    right: 100,
                    top: 0,
                    bottom: 100,
                }) as DOMRect
        )

        const targetItem = createDummyDragItem('1', 2)
        const srcItem = createDummyDragItem('2', 2)
        const monitor = {
            getClientOffset: () => ({x: 50, y: 50}), // Not past the threshold
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })
})

describe('DraggablePreview', () => {
    it('returns null when not dragging', () => {
        mockUseDragLayer.mockReturnValue({
            isDragging: false,
            currentOffset: null,
            item: null,
        })

        const {container} = render(<DraggablePreview />)
        expect(container.firstChild).toBeNull()
    })

    it('returns null when no currentOffset', () => {
        mockUseDragLayer.mockReturnValue({
            isDragging: true,
            currentOffset: null,
            item: null,
        })

        const {container} = render(<DraggablePreview />)
        expect(container.firstChild).toBeNull()
    })

    it('renders preview with correct positioning', () => {
        const mockItem = {
            rect: {
                width: 200,
                height: 150,
            },
            element: <div>Mock Content</div>,
        }

        mockUseDragLayer.mockReturnValue({
            isDragging: true,
            currentOffset: {x: 100, y: 50},
            item: mockItem,
        })

        const {container} = render(<DraggablePreview />)

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
        const mockItem = {
            rect: {
                width: 200,
                height: 150,
            },
            element: <div data-testid="mock-content">Mock Content</div>,
        }

        mockUseDragLayer.mockReturnValue({
            isDragging: true,
            currentOffset: {x: 100, y: 50},
            item: mockItem,
        })

        const {getByTestId} = render(<DraggablePreview />)
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
        const {result} = renderHook(() => useMeasure(ref))

        expect(result.current).toEqual(defaultState)
    })

    it('should not set up ResizeObserver if ref is null', () => {
        const ref = React.createRef<HTMLDivElement>()
        renderHook(() => useMeasure(ref))

        expect(mockResizeObserver).not.toHaveBeenCalled()
        expect(mockObserve).not.toHaveBeenCalled()
    })

    it('should set up ResizeObserver when ref is available', () => {
        const ref = {current: document.createElement('div')}
        renderHook(() => useMeasure(ref))

        expect(mockResizeObserver).toHaveBeenCalled()
        expect(mockObserve).toHaveBeenCalledWith(ref.current)
    })

    it('should update measurements when ResizeObserver fires', async () => {
        const ref = {current: document.createElement('div')}
        const {result} = renderHook(() => useMeasure(ref))

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
                const {toJSON: __toJSON, ...rest} = contentRect
                return rest
            },
        }

        act(() => {
            const [[callback]] = mockResizeObserver.mock.calls as [
                [ResizeObserverCallback],
            ]
            callback(
                [{contentRect} as ResizeObserverEntry],
                mockResizeObserver as unknown as ResizeObserver
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
        const ref = {current: document.createElement('div')}
        const {unmount} = renderHook(() => useMeasure(ref))

        unmount()

        expect(mockDisconnect).toHaveBeenCalled()
    })
})
