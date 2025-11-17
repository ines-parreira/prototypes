import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    createSelectableColumn,
    createSortableColumn,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { Field } from '../../MetafieldsTable/types'
import MetafieldTypeItem, {
    type MetafieldType,
} from '../../MetafieldTypeItem/MetafieldTypeItem'
import { isSupportedMetafieldType } from '../../utils/isSupportedMetafieldType'

export const columns: ColumnDef<Field>[] = [
    createSelectableColumn<Field>(),
    createSortableColumn<Field>('name', 'Name', (info) => {
        return (
            <Box gap="xxxs" minWidth="200px">
                {isSupportedMetafieldType(info.row.original.type) ? (
                    <Text variant="bold">{info.getValue() as string}</Text>
                ) : (
                    <Box gap="xxxs" alignItems="center">
                        <span style={{ opacity: '0.5' }}>
                            {' '}
                            <Text variant="bold">
                                {info.getValue() as string}
                            </Text>
                        </span>

                        <Tooltip>
                            <TooltipTrigger>
                                <span role="button" tabIndex={0}>
                                    <Icon
                                        color={'var(--content-warning-primary)'}
                                        name="triangle-warning"
                                    />
                                </span>
                            </TooltipTrigger>

                            <TooltipContent
                                title="Unsuppported Type"
                                caption="Gorgias does not support this metafield type."
                            />
                        </Tooltip>
                    </Box>
                )}
            </Box>
        )
    }),
    {
        accessorKey: 'type',
        header: 'Type',
        cell: (info) => (
            <MetafieldTypeItem
                disabled={
                    !isSupportedMetafieldType(info.getValue() as MetafieldType)
                }
                type={info.getValue() as MetafieldType}
            />
        ),
    },
]
