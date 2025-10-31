import {
    Box,
    Button,
    ColumnDef,
    createSortableColumn,
    Text,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import CategoryChip from '../CategoryChip/CategoryChip'
import MetafieldTypeItem, {
    MetafieldType,
} from '../MetafieldTypeItem/MetafieldTypeItem'
import { MetafieldCategory } from '../types'
import VisibilityChip from '../VisibilityChip/VisibilityChip'
import { Field, MetafieldsTableMeta } from './types'

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
        cell: (info) => (
            <MetafieldTypeItem type={info.getValue() as MetafieldType} />
        ),
    },
    createSortableColumn<Field>('category', 'Category', (info) => (
        <CategoryChip category={info.getValue() as MetafieldCategory} />
    )),
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
                    <Button
                        id={`control-visibility${metafieldId}`}
                        variant="tertiary"
                        icon={isVisible ? 'show' : 'hide'}
                        onClick={() =>
                            onVisibilityToggle(metafieldId, isVisible)
                        }
                    />
                    <Tooltip
                        target={`control-visibility${metafieldId}`}
                        placement="left"
                    >
                        Remove metafield from Gorgias. <br />
                        This action won&apos;t delete it from Shopify.
                    </Tooltip>
                    <Button
                        variant="tertiary"
                        icon="remove-minus-circle"
                        onClick={() => onRemoveClick(metafieldId)}
                    />
                </Box>
            )
        },
    },
]
