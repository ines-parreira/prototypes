import { Box, Button, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { formatDuration } from '../../utils'
import type { GetColumnsFunction } from './types'

export const getColumns: GetColumnsFunction = ({ onEdit, onDelete }) => [
    {
        id: 'name',
        accessorKey: 'name',
        header: () => {
            return <Box paddingLeft="xs">Status</Box>
        },
        enableSorting: false,
        cell: ({ row }) => {
            const { name } = row.original
            return (
                <Box paddingLeft="xs">
                    <Text variant="bold">{name}</Text>
                </Box>
            )
        },
    },
    {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        enableSorting: false,
        cell: ({ row }) => {
            const { description } = row.original
            return <Text>{description || '—'}</Text>
        },
    },
    {
        id: 'duration',
        accessorKey: 'durationDisplay',
        header: 'Duration',
        enableSorting: false,
        cell: ({ row }) => {
            const { durationDisplay, duration_unit, duration_value } =
                row.original

            // Use explicit display if provided (for system statuses)
            if (durationDisplay) {
                return <Text>{durationDisplay}</Text>
            }

            return <Text>{formatDuration(duration_unit, duration_value)}</Text>
        },
    },
    {
        id: 'actions',
        cell: (info) => {
            const { name, is_system } = info.row.original

            return (
                <Box gap="xs">
                    <Tooltip
                        trigger={
                            <Button
                                variant="tertiary"
                                icon="edit-pencil"
                                onClick={() => onEdit(info.row.original)}
                                isDisabled={is_system}
                                aria-label={
                                    is_system
                                        ? `Cannot edit system status ${name}`
                                        : `Edit ${name} status`
                                }
                            />
                        }
                    >
                        <TooltipContent
                            title={
                                is_system
                                    ? 'System statuses cannot be edited'
                                    : 'Edit status'
                            }
                        />
                    </Tooltip>

                    <Tooltip
                        trigger={
                            <Button
                                variant="tertiary"
                                icon="trash-empty"
                                onClick={() => onDelete(info.row.original)}
                                isDisabled={is_system}
                                aria-label={
                                    is_system
                                        ? `Cannot delete system status ${name}`
                                        : `Delete ${name} status`
                                }
                            />
                        }
                    >
                        <TooltipContent
                            title={
                                is_system
                                    ? 'System statuses cannot be deleted'
                                    : 'Delete status'
                            }
                        />
                    </Tooltip>
                </Box>
            )
        },
    },
]
