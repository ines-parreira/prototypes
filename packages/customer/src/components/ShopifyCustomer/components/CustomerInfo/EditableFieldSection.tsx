import type { ReactNode } from 'react'
import { useState } from 'react'

import {
    Box,
    Button,
    HeaderCell,
    Icon,
    TableBody,
    TableHeader,
    TableRoot,
    TableRow,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import { DraggableFieldRow } from './DraggableFieldRow'

import css from './EditShopifyFieldsSidePanel.less'

type FieldWithLabel = {
    id: string
    label: string
    visible: boolean
    displayValue: ReactNode
}

type Props = {
    label: string
    fields: FieldWithLabel[]
    dragType: string
    onToggleAll: () => void
    onToggleVisibility: (id: string) => void
    onDrop: (dragIndex: number, hoverIndex: number) => void
}

export function EditableFieldSection({
    label,
    fields,
    dragType,
    onToggleAll,
    onToggleVisibility,
    onDrop,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(true)
    const allVisible = fields.length > 0 && fields.every((f) => f.visible)

    return (
        <div className={css.sectionContainer}>
            <Box
                pt="sm"
                pb="sm"
                pl="md"
                pr="md"
                justifyContent="space-between"
                alignItems="center"
                className={css.sectionHeader}
            >
                <Text variant="bold">{label}</Text>
                <Box gap="sm" alignItems="center">
                    <ToggleField value={allVisible} onChange={onToggleAll} />
                    <Button
                        variant="tertiary"
                        icon={
                            isExpanded
                                ? 'arrow-chevron-up'
                                : 'arrow-chevron-down'
                        }
                        aria-label={
                            isExpanded
                                ? `Collapse ${label} fields`
                                : `Expand ${label} fields`
                        }
                        onClick={() => setIsExpanded((v) => !v)}
                    />
                </Box>
            </Box>
            {isExpanded && (
                <TableRoot>
                    <TableHeader>
                        <TableRow>
                            <HeaderCell className={css.dragHeaderCell}>
                                <Icon name="arrow-down-up" />
                            </HeaderCell>
                            <HeaderCell className={css.metricHeaderCell}>
                                Metric
                            </HeaderCell>
                            <HeaderCell className={css.valueHeaderCell} />
                            <HeaderCell className={css.toggleHeaderCell}>
                                Show
                            </HeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <DraggableFieldRow
                                key={field.id}
                                field={field}
                                index={index}
                                dragType={dragType}
                                onToggleVisibility={onToggleVisibility}
                                onDrop={onDrop}
                            />
                        ))}
                    </TableBody>
                </TableRoot>
            )}
        </div>
    )
}
