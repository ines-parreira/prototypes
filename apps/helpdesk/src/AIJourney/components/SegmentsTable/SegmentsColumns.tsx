import { formatDatetime } from '@repo/utils'

import type { ColumnDef } from '@gorgias/axiom'
import {
    createTableV1SortableColumn,
    Skeleton,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'
import { useAudienceCount } from 'AIJourney/queries/useAudienceCount/useAudienceCount'

import { SegmentMoreOptions } from './SegmentMoreOptions/SegmentMoreOptions'

import css from './SegmentsColumns.less'

export type SegmentsTableMeta = {
    integrationId: number | null | undefined
    canWrite: boolean
    onSegmentClick: (segment: Segment) => void
    onEditClick: (segment: Segment) => void
    onDuplicateClick: (segment: Segment) => void
    onDeleteClick: (segment: Segment) => void
}

type SegmentAudienceCellProps = {
    segment: Segment
    integrationId: number | null | undefined
}

const SegmentAudienceCell = ({
    segment,
    integrationId,
}: SegmentAudienceCellProps) => {
    const { data, isFetching } = useAudienceCount({
        integration_id: integrationId,
        conditions: segment.conditions,
    })

    if (isFetching) {
        return <Skeleton width="60px" height="16px" />
    }

    const count = data?.count ?? segment.count
    return (
        <Text>
            {count != null
                ? count > 0
                    ? `±${count.toLocaleString()}`
                    : count.toLocaleString()
                : '—'}
        </Text>
    )
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
    createTableV1SortableColumn<Segment>('count', 'Estimated size', (info) => {
        const { integrationId } = info.table.options.meta as SegmentsTableMeta
        return (
            <SegmentAudienceCell
                segment={info.row.original}
                integrationId={integrationId}
            />
        )
    }),
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
            const { canWrite, onEditClick, onDuplicateClick, onDeleteClick } =
                info.table.options.meta as SegmentsTableMeta
            if (!canWrite) return null
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
