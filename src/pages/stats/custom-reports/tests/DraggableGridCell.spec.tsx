import {DropTargetMonitor} from 'react-dnd'

import {
    createDragItem,
    createMoveHandler,
} from 'pages/stats/custom-reports/DraggableGridCell'

describe('createMoveHandler(node, target, handleMove)', () => {
    it('returns a function', () => {
        const node = document.createElement('div')
        const item = createDragItem({order: 1, size: 2})
        const onMove = jest.fn()

        const actual = createMoveHandler(node, item, onMove)

        expect(typeof actual).toBe('function')
    })

    it('does nothing if node is null', () => {
        const targetItem = createDragItem({order: 1, size: 2})
        const srcItem = createDragItem({order: 2, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 0, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(null, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    it('does nothing if dragIndex equals hoverIndex', () => {
        const node = document.createElement('div')
        const item = createDragItem({order: 1, size: 2})
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

        const targetItem = createDragItem({order: 1, size: 2})
        const srcItem = createDragItem({order: 2, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 40, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(2, 1)
    })

    it('calls onMove if hovering over a card and moving it forward within the movement threshold on the Y-axis', () => {
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

        const targetItem = createDragItem({order: 1, size: 2})
        const srcItem = createDragItem({order: 2, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 0, y: 40}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(2, 1)
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

        const targetItem = createDragItem({order: 2, size: 2})
        const srcItem = createDragItem({order: 1, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 60, y: 0}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(1, 2)
    })

    it('calls onMove if hovering over a card and moving it backward within the movement threshold on the Y-axis', () => {
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

        const targetItem = createDragItem({order: 2, size: 2})
        const srcItem = createDragItem({order: 1, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 0, y: 60}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(1, 2)
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

        const targetItem = createDragItem({order: 1, size: 12}) // Big card
        const srcItem = createDragItem({order: 2, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 0, y: 20}), // Over half vertically
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(2, 1)
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

        const targetItem = createDragItem({order: 2, size: 12}) // Big card
        const srcItem = createDragItem({order: 1, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 0, y: 80}), // Over half vertically
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).toHaveBeenCalledWith(1, 2)
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

        const targetItem = createDragItem({order: 1, size: 2})
        const srcItem = createDragItem({order: 2, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 60, y: 60}), // Not past the threshold
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(onMove).not.toHaveBeenCalled()
    })

    it('updates the dragged item order after move', () => {
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

        const targetItem = createDragItem({order: 1, size: 2})
        const srcItem = createDragItem({order: 2, size: 2})
        const monitor = {
            getClientOffset: () => ({x: 40, y: 40}),
        } as DropTargetMonitor
        const onMove = jest.fn()

        const handleMove = createMoveHandler(node, targetItem, onMove)

        handleMove(srcItem, monitor)

        expect(srcItem.order).toBe(1)
    })
})
