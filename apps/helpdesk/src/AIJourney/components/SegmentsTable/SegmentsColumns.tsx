import { formatDatetime } from '@repo/utils'

import type { ColumnDef } from '@gorgias/axiom'
import { createTableV1SortableColumn, Text, TextVariant } from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentMoreOptions } from './SegmentMoreOptions/SegmentMoreOptions'

import css from './SegmentsColumns.less'

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
                <button
                    onClick={() => onSegmentClick(info.row.original)}
                    className={css.titleButton}
                >
                    <Text variant={TextVariant.Bold}>
                        {info.row.original.name}
                    </Text>
                </button>
            )
        },
        enableSorting: true,
    },
    createTableV1SortableColumn<Segment>('count', 'Estimated size', (info) => (
        <Text>
            {info.row.original.count != null
                ? `±${info.row.original.count.toLocaleString()}`
                : '—'}
        </Text>
    )),
    createTableV1SortableColumn<Segment>(
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
