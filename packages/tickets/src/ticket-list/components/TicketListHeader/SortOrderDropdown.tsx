import { useCallback, useMemo } from 'react'

import {
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSection,
    MenuSize,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import { useSortOrder } from '../../hooks/useSortOrder'

export const SORT_FIELDS = [
    {
        id: 'last_message_datetime',
        label: 'Last message',
        asc: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        desc: ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
    },
    {
        id: 'last_received_message_datetime',
        label: 'Last received message',
        asc: ListViewItemsUpdatesOrderBy.LastReceivedMessageDatetimeAsc,
        desc: ListViewItemsUpdatesOrderBy.LastReceivedMessageDatetimeDesc,
    },
    {
        id: 'created_datetime',
        label: 'Ticket created',
        asc: ListViewItemsUpdatesOrderBy.CreatedDatetimeAsc,
        desc: ListViewItemsUpdatesOrderBy.CreatedDatetimeDesc,
    },
    {
        id: 'updated_datetime',
        label: 'Last updated',
        asc: ListViewItemsUpdatesOrderBy.UpdatedDatetimeAsc,
        desc: ListViewItemsUpdatesOrderBy.UpdatedDatetimeDesc,
    },
    {
        id: 'priority',
        label: 'Priority',
        asc: ListViewItemsUpdatesOrderBy.PriorityAsc,
        desc: ListViewItemsUpdatesOrderBy.PriorityDesc,
    },
]

export function parseSortOrder(sortOrder: ListViewItemsUpdatesOrderBy) {
    const direction = sortOrder.endsWith(':asc') ? 'asc' : 'desc'
    const field = SORT_FIELDS.find(
        (f) => f.asc === sortOrder || f.desc === sortOrder,
    )
    return { field, direction } as const
}

type Props = {
    viewId: number
}

export function SortOrderDropdown({ viewId }: Props) {
    const [sortOrder, setSortOrder] = useSortOrder(viewId)

    const currentSort = useMemo(() => parseSortOrder(sortOrder), [sortOrder])

    const handleSortClick = useCallback(
        (fieldId: string) => {
            const field = SORT_FIELDS.find((f) => f.id === fieldId)
            if (!field) return
            if (currentSort.field?.id === fieldId) {
                const newDirection =
                    currentSort.direction === 'desc' ? 'asc' : 'desc'
                setSortOrder(field[newDirection])
            } else {
                setSortOrder(field.desc)
            }
        },
        [currentSort, setSortOrder],
    )

    return (
        <Tooltip
            trigger={
                <Menu
                    placement={MenuPlacement.BottomRight}
                    size={MenuSize.Sm}
                    aria-label="Sort view by"
                    selectionMode="single"
                    selectedKeys={new Set([currentSort.field?.id ?? ''])}
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="arrow-down-up"
                            aria-label="Sort view by"
                        />
                    }
                >
                    <MenuSection id="sort-options" name="Sort tickets">
                        {SORT_FIELDS.map((field) => (
                            <SortOrderMenuItem
                                key={field.id}
                                fieldId={field.id}
                                fieldLabel={field.label}
                                isSelected={field.id === currentSort.field?.id}
                                isDescending={currentSort.direction === 'desc'}
                                onAction={handleSortClick}
                            />
                        ))}
                    </MenuSection>
                </Menu>
            }
        >
            <TooltipContent title="Sort view by" />
        </Tooltip>
    )
}

type SortOrderMenuItemProps = {
    fieldId: string
    fieldLabel: string
    isSelected: boolean
    isDescending: boolean
    onAction: (fieldId: string) => void
}

function SortOrderMenuItem({
    fieldId,
    fieldLabel,
    isSelected,
    isDescending,
    onAction,
}: SortOrderMenuItemProps) {
    return (
        <MenuItem
            id={fieldId}
            label={fieldLabel}
            trailingSlot={
                isSelected ? (
                    <Icon name={isDescending ? 'arrow-down' : 'arrow-up'} />
                ) : undefined
            }
            onAction={() => onAction(fieldId)}
        />
    )
}
