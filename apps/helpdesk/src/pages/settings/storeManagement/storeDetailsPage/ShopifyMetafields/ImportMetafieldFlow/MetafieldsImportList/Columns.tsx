import {
    Box,
    ColumnDef,
    createSelectableColumn,
    createSortableColumn,
    Text,
} from '@gorgias/axiom'

import { Field } from '../../MetafieldsTable/types'
import MetafieldTypeItem, {
    MetafieldType,
} from '../../MetafieldTypeItem/MetafieldTypeItem'

export const columns: ColumnDef<Field>[] = [
    createSelectableColumn<Field>(),
    createSortableColumn<Field>('name', 'Name', (info) => {
        return (
            <Box gap="xxxs" minWidth="200px">
                <Text variant="bold">{info.getValue() as string}</Text>
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
]
