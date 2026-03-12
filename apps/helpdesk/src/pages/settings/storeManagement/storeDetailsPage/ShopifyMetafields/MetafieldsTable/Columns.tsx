import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Button,
    createSortableColumn,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import CategoryChip from '../CategoryChip/CategoryChip'
import MetafieldTypeItem from '../MetafieldTypeItem/MetafieldTypeItem'
import type { SupportedCategories } from '../types'
import VisibilityChip from '../VisibilityChip/VisibilityChip'
import type { Field, MetafieldsTableMeta } from './types'

export const columns: ColumnDef<Field>[] = [
    createSortableColumn<Field>('name', 'Name', (info) => {
        const isVisible = info.row.original.isVisible ?? false

        return (
            <Box gap="xxxs" minWidth="200px" alignItems="center">
                <Text variant="bold">{info.getValue() as string}</Text>
                {!isVisible && <VisibilityChip />}
            </Box>
        )
    }),
    {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: false,
        cell: (info) => (
            <MetafieldTypeItem type={info.getValue() as MetafieldType} />
        ),
    },
    {
        accessorKey: 'category',
        header: 'Category',
        enableSorting: false,
        cell: (info) => (
            <CategoryChip category={info.getValue() as SupportedCategories} />
        ),
        filterFn: 'equalsString',
    },
    {
        id: 'actions',
        cell: (info) => {
            const meta = info.table.options.meta as MetafieldsTableMeta
            const onRemoveClick = meta.onRemoveClick
            const onVisibilityToggle = meta.onVisibilityToggle
            const metafieldId = info.row.original.id
            const isVisible = info.row.original.isVisible ?? true
            return (
                <Box gap="xs">
                    <Tooltip
                        placement="top right"
                        trigger={
                            <Button
                                id="metafield-visibility-toggle"
                                variant="tertiary"
                                icon={isVisible ? 'show' : 'hide'}
                                onClick={() =>
                                    onVisibilityToggle(metafieldId, isVisible)
                                }
                            />
                        }
                    >
                        <TooltipContent>
                            <Text size="sm">
                                Show metafield data when viewing <br /> a
                                customer profile and ticket.
                            </Text>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip
                        placement="top right"
                        trigger={
                            <Button
                                variant="tertiary"
                                id={metafieldId}
                                icon="remove-minus-circle"
                                onClick={() => onRemoveClick(metafieldId)}
                            />
                        }
                    >
                        <TooltipContent>
                            <Text size="sm">
                                Remove metafield from Gorgias. <br />
                                This action won&apos;t delete it from <br />
                                Shopify.
                            </Text>
                        </TooltipContent>
                    </Tooltip>
                </Box>
            )
        },
    },
]
