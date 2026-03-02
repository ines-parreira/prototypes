import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useDeepEffect } from '@repo/hooks'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
    Button,
    HeaderCell,
    Icon,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
    TableBody,
    TableCell,
    TableHeader,
    TableRoot,
    TableRow,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import type { MetricConfigItem } from './types'

import css from './ConfigureMetricsModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    metrics: MetricConfigItem[]
    onSave: (metrics: MetricConfigItem[]) => void
    maxVisibleMetric?: number
    isLoading?: boolean
}

type DraggableRowProps = {
    metric: MetricConfigItem
    index: number
    onToggleVisibility: (id: string) => void
    onDrop: (dragIndex: number, hoverIndex: number) => void
    isDisabled: boolean
}

const DraggableRow = ({
    metric,
    index,
    onToggleVisibility,
    onDrop,
    isDisabled,
}: DraggableRowProps) => {
    const ref = useRef<HTMLTableRowElement>(null)

    const [{ isDragging }, drag] = useDrag({
        type: 'metric',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const [, drop] = useDrop<{ index: number }, void, unknown>({
        accept: 'metric',
        hover: (item) => {
            if (!ref.current) {
                return
            }

            const dragIndex = item.index
            const hoverIndex = index

            if (dragIndex === hoverIndex) {
                return
            }

            onDrop(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    drag(drop(ref))

    return (
        <TableRow
            ref={ref}
            className={css.row}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <TableCell className={css.dragCell}>
                <div className={css.dragHandle}>
                    <Icon name="grip" />
                </div>
            </TableCell>
            <TableCell className={css.metricNameCell}>
                <Text>{metric.label}</Text>
            </TableCell>
            <TableCell className={css.toggleCell}>
                <ToggleField
                    value={metric.visibility}
                    onChange={() => onToggleVisibility(metric.id)}
                    isDisabled={isDisabled}
                />
            </TableCell>
        </TableRow>
    )
}

export const ConfigureMetricsModal = ({
    isOpen,
    onClose,
    metrics,
    onSave,
    maxVisibleMetric = 4,
    isLoading,
}: Props) => {
    const [localMetrics, setLocalMetrics] =
        useState<MetricConfigItem[]>(metrics)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const chatContainer = document.getElementById('gorgias-chat-container')

        if (chatContainer) {
            if (isOpen) {
                chatContainer.style.display = 'none'
            } else {
                chatContainer.style.display = ''
            }
        }

        return () => {
            if (chatContainer) {
                chatContainer.style.display = ''
            }
        }
    }, [isOpen])

    useDeepEffect(() => {
        setLocalMetrics(metrics)
        setHasChanges(false)
    }, [metrics])

    const currentVisibleCount = localMetrics.filter((m) => m.visibility).length

    const handleToggleVisibility = useCallback((id: string) => {
        setLocalMetrics((prev) =>
            prev.map((metric) =>
                metric.id === id
                    ? { ...metric, visibility: !metric.visibility }
                    : metric,
            ),
        )
        setHasChanges(true)
    }, [])

    const handleDrop = useCallback((dragIndex: number, hoverIndex: number) => {
        setLocalMetrics((prev) => {
            const newMetrics = [...prev]
            const [draggedItem] = newMetrics.splice(dragIndex, 1)
            newMetrics.splice(hoverIndex, 0, draggedItem)
            return newMetrics
        })
        setHasChanges(true)
    }, [])

    const handleSave = useCallback(() => {
        onSave(localMetrics)
        // Auto-close when isLoading prop is not provided (synchronous save).
        // When isLoading is provided, the parent controls closing after async save completes.
        if (isLoading === undefined) {
            onClose()
        }
    }, [localMetrics, onSave, onClose, isLoading])

    const handleCancel = useCallback(() => {
        setLocalMetrics(metrics)
        setHasChanges(false)
        onClose()
    }, [metrics, onClose])

    return (
        <SidePanel isOpen={isOpen} onOpenChange={handleCancel} size="sm">
            <OverlayHeader
                title="Edit metrics"
                description={`Choose the ${maxVisibleMetric} metrics you want to display and rearrange them as needed.`}
            />

            <OverlayContent>
                <DndProvider backend={HTML5Backend}>
                    <div className={css.tableContainer}>
                        <TableRoot withBorder>
                            <TableHeader>
                                <TableRow>
                                    <HeaderCell className={css.dragHeaderCell}>
                                        <Icon name="arrow-down-up" />
                                    </HeaderCell>
                                    <HeaderCell
                                        className={css.metricHeaderCell}
                                    >
                                        Metric name
                                    </HeaderCell>
                                    <HeaderCell
                                        className={css.toggleHeaderCell}
                                    >
                                        Show
                                    </HeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localMetrics.map((metric, index) => (
                                    <DraggableRow
                                        key={metric.id}
                                        metric={metric}
                                        index={index}
                                        onToggleVisibility={
                                            handleToggleVisibility
                                        }
                                        onDrop={handleDrop}
                                        isDisabled={
                                            !metric.visibility &&
                                            currentVisibleCount >=
                                                maxVisibleMetric
                                        }
                                    />
                                ))}
                            </TableBody>
                        </TableRoot>
                    </div>
                </DndProvider>
            </OverlayContent>

            <OverlayFooter>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isDisabled={!hasChanges || !!isLoading}
                    isLoading={isLoading ?? false}
                >
                    Save
                </Button>
            </OverlayFooter>
        </SidePanel>
    )
}
