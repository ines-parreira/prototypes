import { formatDatetime } from '@repo/utils'

import type { ColumnDef } from '@gorgias/axiom'
import { createSortableColumn, Text, TextVariant } from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentMoreOptions } from './SegmentMoreOptions/SegmentMoreOptions'

export type SegmentsTableMeta = {
    onSegmentClick: (segment: Segment) => void
    onEditClick: (segment: Segment) => void
    onDuplicateClick: (segment: Segment) => void
    onDeleteClick: (segment: Segment) => void
}

export const segmentColumns: ColumnDef<Segment>[] = [
    {
        id: 'name',
        accessorKey: 'name',
        header: 'Title',
        cell: (info) => {
            const { onSegmentClick } = info.table.options
                .meta as SegmentsTableMeta
            return (
                <Text
                    onClick={() => onSegmentClick(info.row.original)}
                    variant={TextVariant.Bold}
                >
                    {info.row.original.name}
                </Text>
            )
        },
        enableSorting: true,
    },
    createSortableColumn<Segment>('count', 'Estimated size', (info) => (
        <Text>±{info.row.original.count.toLocaleString()}</Text>
    )),
    createSortableColumn<Segment>(
        'updated_datetime',
        'Last updated',
        (info) => (
            <Text>
                {formatDatetime(
                    info.row.original.updated_datetime,
                    'MMM D, YYYY',
                )}
            </Text>
        ),
    ),
]

export const actionColumns: ColumnDef<Segment, unknown>[] = [
    {
        id: 'actions',
        cell: (info) => {
            const { onEditClick, onDuplicateClick, onDeleteClick } = info.table
                .options.meta as SegmentsTableMeta
            return (
                <SegmentMoreOptions
                    segment={info.row.original}
                    onEditClick={onEditClick}
                    onDuplicateClick={onDuplicateClick}
                    onDeleteClick={onDeleteClick}
                />
            )
        },
    },
]
