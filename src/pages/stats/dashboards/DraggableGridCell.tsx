import React, { forwardRef, isValidElement, useRef } from 'react'

import classNames from 'classnames'
import {
    DragSourceMonitor,
    DropTargetMonitor,
    useDrag,
    useDragLayer,
    useDrop,
} from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import IconInput from 'pages/common/forms/input/IconInput'
import DashboardGrid from 'pages/stats/DashboardGrid'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import css from 'pages/stats/dashboards/DraggableGridCell.less'
import {
    ChartType,
    DashboardChartSchema,
    DashboardChild,
    DashboardChildType,
} from 'pages/stats/dashboards/types'

export const createDragItem = ({
    size,
    schema,
    element,
    rect,
}: {
    size: number
    schema: DashboardChartSchema
    element: React.ReactNode
    rect: MeasureRect
}) => ({
    ...schema,
    size,
    type: ChartType.Card,
    element,
    rect,
})

type DragItem = ReturnType<typeof createDragItem>

export const isDragItem = (item: unknown): item is DragItem => {
    return (
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        item.type === ChartType.Card &&
        'size' in item &&
        typeof item.size === 'number' &&
        'element' in item &&
        isValidElement(item.element) &&
        'rect' in item &&
        typeof item.rect === 'object'
    )
}

export const createMoveHandler =
    (
        node: HTMLElement | null,
        target: DragItem,
        handleMove: MoveHandler,
        findChartIndex: FindChartIndex,
    ) =>
    (item: DragItem, monitor: DropTargetMonitor) => {
        if (!node) return

        const dragItem = item
        const hoverItem = target

        const dragSize = item.size
        const hoverSize = target.size

        if (dragItem.config_id === hoverItem.config_id) return

        const hoverRect = node.getBoundingClientRect()

        const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2
        const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2

        // Get mouse position
        const clientOffset = monitor.getClientOffset()!
        const hoverClientX = clientOffset.x - hoverRect.left
        const hoverClientY = clientOffset.y - hoverRect.top

        let position: 'before' | 'after' | null = null

        const isOverSmallerTarget = hoverSize <= dragSize
        if (isOverSmallerTarget) {
            position =
                findChartIndex(dragItem.config_id) <
                findChartIndex(hoverItem.config_id)
                    ? 'after'
                    : 'before'
        } else {
            if (hoverSize === 12) {
                if (hoverClientY > hoverMiddleY) {
                    position = 'after'
                } else if (hoverClientY < hoverMiddleY) {
                    position = 'before'
                }
            } else {
                if (
                    hoverClientX > hoverMiddleX ||
                    hoverClientY > hoverMiddleY
                ) {
                    position = 'after'
                } else if (
                    hoverClientX < hoverMiddleX ||
                    hoverClientY < hoverMiddleY
                ) {
                    position = 'before'
                }
            }
        }

        if (position) {
            handleMove(dragItem.config_id, hoverItem.config_id, position)
        }
    }

export type MoveHandler = (
    srcId: string,
    targetId: string,
    position: 'after' | 'before',
) => void

export type DropHandler = () => void

export type FindChartIndex = (chartId: string) => number

export type DraggableGridCellProps = {
    children: React.ReactNode
    size: number
    schema: DashboardChartSchema
    onMove: MoveHandler
    onDrop: DropHandler
    findChartIndex: FindChartIndex
}

const HANDLE_WIDTH = 40

export const createIsDragging =
    (item: DragItem) => (monitor: DragSourceMonitor) => {
        return item.config_id === (monitor.getItem() as DragItem).config_id
    }

export const DraggableGridCell = ({
    children,
    size,
    schema,
    onDrop,
    onMove,
    findChartIndex,
}: DraggableGridCellProps) => {
    const previewRef = useRef<HTMLDivElement>(null)

    const rect = useMeasure(previewRef)
    const item = createDragItem({
        element: children,
        schema,
        size,
        rect,
    })

    const [{ isDragging }, drag, preview] = useDrag({
        item,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
        isDragging: createIsDragging(item),
    })

    const [, drop] = useDrop<typeof item, void, void>({
        accept: item.type,
        hover: createMoveHandler(
            previewRef.current,
            item,
            onMove,
            findChartIndex,
        ),
        drop: onDrop,
    })

    preview(drop(previewRef))
    preview(getEmptyImage(), { captureDraggingState: false })

    return (
        <DashboardGridCell size={size} className="pb-0">
            <div
                ref={previewRef}
                className={classNames(
                    css.root,
                    css.fallback,
                    isDragging && css.isDragging,
                )}
            >
                <Handle ref={drag} />
                {children}
            </div>
        </DashboardGridCell>
    )
}

function findFirstChartRecursive(children: DashboardChild[]) {
    for (const child of children) {
        if (child.type === DashboardChildType.Chart) {
            return child
        }

        if (
            child.type === DashboardChildType.Row ||
            child.type === DashboardChildType.Section
        ) {
            return findFirstChartRecursive(child.children)
        }
    }
}

export const createDropzoneHoverHandler =
    (schemas: DashboardChild[], onMove: MoveHandler) => (item: DragItem) => {
        const firstChart = findFirstChartRecursive(schemas)

        if (!firstChart || item.config_id === firstChart.config_id) return

        onMove(item.config_id, firstChart.config_id, 'before')
    }

export const Dropzone = ({
    schemas,
    onMove,
}: {
    schemas: DashboardChild[]
    onMove: MoveHandler
}) => {
    const [, drop] = useDrop<DragItem, void, void>({
        accept: ChartType.Card,
        hover: createDropzoneHoverHandler(schemas, onMove),
    })

    return <div ref={drop} style={{ height: 4 }} />
}

const Handle = forwardRef<HTMLSpanElement>((_, ref) => {
    const id = 'handle-' + useId()

    return (
        <span ref={ref} className={css.handle} style={{ width: HANDLE_WIDTH }}>
            <IconInput id={id} icon="drag_indicator" className={css.icon} />
            <Tooltip target={id} placement="top">
                Drag to move chart
            </Tooltip>
        </span>
    )
})

export const DraggablePreview = () => {
    const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
    }))

    if (!isDragging || !currentOffset || !isDragItem(item)) return null

    const handleOffset = { x: item.rect.width / 2 - HANDLE_WIDTH / 2, y: 0 }

    const x = currentOffset.x - handleOffset.x
    const y = currentOffset.y - handleOffset.y

    const transform = `translate(${x}px, ${y}px)`

    return (
        <div
            className={css.preview}
            style={{
                transform,
                width: item.rect.width,
                height: item.rect.height,
            }}
        >
            {item.element}
        </div>
    )
}

const isSameRow = (charts: DashboardChartSchema[], item: DragItem) => {
    return charts.some((chart) => chart.config_id === item.config_id)
}

export const createMoveRawHandler =
    (charts: DashboardChartSchema[], onMove: MoveHandler) =>
    (item: DragItem) => {
        if (isSameRow(charts, item)) return

        const lastChart = charts[charts.length - 1]
        onMove(item.config_id, lastChart.config_id, 'after')
    }

export type DroppableGridRowProps = {
    children: React.ReactNode
    charts: DashboardChartSchema[]
    onMove: MoveHandler
}

export const DroppableGridRow = ({
    children,
    charts,
    onMove,
}: DroppableGridRowProps) => {
    const [, drop] = useDrop<DragItem, void, void>({
        accept: ChartType.Card,
        hover: createMoveRawHandler(charts, onMove),
    })

    return <DashboardGrid ref={drop}>{children}</DashboardGrid>
}

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

export type MeasureRect = typeof defaultState

export function useMeasure(ref: React.RefObject<HTMLDivElement>) {
    const [rect, setRect] = React.useState<MeasureRect>(defaultState)

    React.useLayoutEffect(() => {
        if (!ref.current) return

        const observer = new window.ResizeObserver((entries) => {
            if (entries[0]) setRect(entries[0].contentRect.toJSON())
        })

        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [ref])

    return rect
}
