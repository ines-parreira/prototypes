import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Button,
    createSortableColumn,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import CategoryChip from '../CategoryChip/CategoryChip'
import type { MetafieldType } from '../MetafieldTypeItem/MetafieldTypeItem'
import MetafieldTypeItem from '../MetafieldTypeItem/MetafieldTypeItem'
import type { MetafieldCategory } from '../types'
import VisibilityChip from '../VisibilityChip/VisibilityChip'
import type { Field, MetafieldsTableMeta } from './types'

export const columns: ColumnDef<Field>[] = [
    createSortableColumn<Field>('name', 'Name', (info) => {
        const isVisible = info.row.original.isVisible ?? false

        return (
            <Box gap="xxxs" minWidth="200px">
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
            <CategoryChip category={info.getValue() as MetafieldCategory} />
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
                    <Tooltip placement="top left">
                        <Button
                            id="metafield-visibility-toggle"
                            variant="tertiary"
                            icon={isVisible ? 'show' : 'hide'}
                            onClick={() =>
                                onVisibilityToggle(metafieldId, isVisible)
                            }
                        />

                        <TooltipContent title="Show metafield data when viewing a customer profile and ticket." />
                    </Tooltip>

                    <Tooltip placement="top left">
                        <Button
                            variant="tertiary"
                            id={metafieldId}
                            icon="remove-minus-circle"
                            onClick={() => onRemoveClick(metafieldId)}
                        />
                        <TooltipContent title="Remove metafield from Gorgias. This action won't delete it from Shopify." />
                    </Tooltip>
                </Box>
            )
        },
    },
]
