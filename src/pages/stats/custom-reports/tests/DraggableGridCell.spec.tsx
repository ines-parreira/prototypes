import {DropTargetMonitor} from 'react-dnd'

import {
    createDragItem,
    createMoveHandler,
} from 'pages/stats/custom-reports/DraggableGridCell'
import {CustomReportChildType} from 'pages/stats/custom-reports/types'

describe('createMoveHandler(node, target, handleMove)', () => {
    const createDummyDragItem = (configId: string = '1', size: number = 2) =>
        createDragItem({
            size,
            schema: {
                config_id: configId,
                type: CustomReportChildType.Chart,
            },
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
