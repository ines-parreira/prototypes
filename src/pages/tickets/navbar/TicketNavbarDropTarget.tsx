import classnames from 'classnames'
import React, {HTMLProps, ReactNode, useRef, useState, useEffect} from 'react'
import {
    DragObjectWithType,
    DropTargetHookSpec,
    DropTargetMonitor,
    useDrop,
} from 'react-dnd'

import css from './TicketNavbarDropTarget.less'

export interface TicketNavbarDragObject extends DragObjectWithType {
    id: number
}

export enum TicketNavbarDropDirection {
    Up = 'up',
    Down = 'down',
}

export type TicketNavbarDropResult = {
    sectionId: number | null
    viewId: number | null
    direction: TicketNavbarDropDirection | null
}

type TicketNavbarDropTargetHookSpec = DropTargetHookSpec<
    TicketNavbarDragObject,
    TicketNavbarDropResult,
    {
        indicatorPosition: TicketNavbarDropDirection | null
    }
>

type Props = Omit<
    HTMLProps<HTMLDivElement>,
    'children' | 'accept' | 'onDrop'
> & {
    accept: TicketNavbarDropTargetHookSpec['accept']
    canDrop?: TicketNavbarDropTargetHookSpec['canDrop']
    onDrop?: (
        item: TicketNavbarDragObject,
        monitor: DropTargetMonitor,
        direction: TicketNavbarDropDirection | null
    ) => TicketNavbarDropResult | Promise<void> | void
    children: ReactNode | ((isOver: boolean) => ReactNode)
    topIndicatorClassName?: string
    bottomIndicatorClassName?: string
    shallow?: boolean
}

const TicketNavbarDropTarget = ({
    accept,
    canDrop,
    className,
    onDrop,
    children,
    topIndicatorClassName,
    bottomIndicatorClassName,
    shallow = true,
    ...other
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [
        indicatorPosition,
        setIndicatorPosition,
    ] = useState<TicketNavbarDropDirection | null>(null)

    const [{isOver}, drop] = useDrop<
        TicketNavbarDragObject,
        TicketNavbarDropResult,
        {
            isOver: boolean
        }
    >({
        accept,
        canDrop,
        hover: (item, monitor) => {
            let nextIndicator = null
            const boundingRect = wrapperRef.current?.getBoundingClientRect()
            const clientOffset = monitor.getClientOffset()

            if (
                monitor.canDrop() &&
                boundingRect &&
                clientOffset &&
                monitor.isOver({shallow})
            ) {
                nextIndicator =
                    clientOffset.y < boundingRect.top + boundingRect.height / 2
                        ? TicketNavbarDropDirection.Up
                        : TicketNavbarDropDirection.Down
            }
            if (indicatorPosition !== nextIndicator) {
                setIndicatorPosition(nextIndicator)
            }
        },
        drop: (item, monitor): TicketNavbarDropResult | undefined => {
            if (!onDrop) {
                return
            }
            const result = onDrop(item, monitor, indicatorPosition)

            if (result) {
                return result as TicketNavbarDropResult
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })
    useEffect(() => {
        if (!isOver && indicatorPosition != null) {
            setIndicatorPosition(null)
        }
    }, [isOver, indicatorPosition])

    drop(wrapperRef)
    return (
        <div
            {...other}
            className={classnames(css.wrapper, className)}
            ref={wrapperRef}
        >
            {indicatorPosition === TicketNavbarDropDirection.Up && (
                <div
                    className={classnames(
                        css.indicator,
                        css.isUp,
                        topIndicatorClassName
                    )}
                />
            )}
            {typeof children === 'function'
                ? children(!!indicatorPosition)
                : children}
            {indicatorPosition === TicketNavbarDropDirection.Down && (
                <div
                    className={classnames(
                        css.indicator,
                        css.isDown,
                        bottomIndicatorClassName
                    )}
                />
            )}
        </div>
    )
}

export default TicketNavbarDropTarget
