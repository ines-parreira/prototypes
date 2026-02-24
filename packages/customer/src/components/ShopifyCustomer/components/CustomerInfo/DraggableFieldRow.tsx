import type { ReactNode } from 'react'
import { useRef } from 'react'

import { useDrag, useDrop } from 'react-dnd'

import { Icon, TableCell, TableRow, Text, ToggleField } from '@gorgias/axiom'

import css from './EditShopifyFieldsSidePanel.less'

type Props = {
    field: {
        id: string
        label: string
        visible: boolean
        displayValue: ReactNode
    }
    index: number
    onToggleVisibility: (id: string) => void
    onDrop: (dragIndex: number, hoverIndex: number) => void
}

const DRAG_TYPE = 'shopify-field'

export function DraggableFieldRow({
    field,
    index,
    onToggleVisibility,
    onDrop,
}: Props) {
    const ref = useRef<HTMLTableRowElement>(null)

    const [{ isDragging }, drag] = useDrag({
        type: DRAG_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const [, drop] = useDrop<{ index: number }, void, unknown>({
        accept: DRAG_TYPE,
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
                <Text
                    className={css.metricLabelText}
                    as="p"
                    overflow="ellipsis"
                >
                    {field.label}
                </Text>
            </TableCell>
            <TableCell className={css.valueCell}>
                <Text className={css.metricValue} as="p" overflow="ellipsis">
                    {field.displayValue}
                </Text>
            </TableCell>
            <TableCell className={css.toggleCell}>
                <ToggleField
                    value={field.visible}
                    onChange={() => onToggleVisibility(field.id)}
                />
            </TableCell>
        </TableRow>
    )
}
