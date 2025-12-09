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

import { MAX_FIELDS_PER_CATEGORY } from '../../constants'
import type { Field } from '../../MetafieldsTable/types'
import MetafieldTypeItem, {
    type MetafieldType,
} from '../../MetafieldTypeItem/MetafieldTypeItem'
import { getCheckboxContent } from '../../utils/getCheckboxContent'
import { isSupportedMetafieldType } from '../../utils/isSupportedMetafieldType'
import { shouldShowLimitTooltip } from '../../utils/shouldShowLimitTooltip'

export const getColumns = (
    selectedMetafields: Field[],
    totalSelectedCount: number,
): ColumnDef<Field>[] => {
    const hasReachedLimit = totalSelectedCount >= MAX_FIELDS_PER_CATEGORY

    const selectableColumn = createSelectableColumn<Field>()
    const originalCell = selectableColumn.cell

    return [
        {
            ...selectableColumn,
            cell: (info) => {
                const isCurrentlySelected = selectedMetafields.some(
                    (field) => field.id === info.row.original.id,
                )
                const isDisabled = !info.row.getCanSelect()
                const isSupportedType = isSupportedMetafieldType(
                    info.row.original.type,
                )

                const showTooltip = shouldShowLimitTooltip({
                    isDisabled,
                    isCurrentlySelected,
                    isSupportedType,
                    hasReachedLimit,
                })

                const checkboxContent = getCheckboxContent(originalCell, info)

                if (showTooltip) {
                    return (
                        <Tooltip>
                            <TooltipTrigger>
                                <div>{checkboxContent}</div>
                            </TooltipTrigger>
                            <TooltipContent
                                title="Import Limit Reached"
                                caption={`You can only import ${MAX_FIELDS_PER_CATEGORY} items`}
                            />
                        </Tooltip>
                    )
                }

                return checkboxContent
            },
        },
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

                            <Tooltip placement="top right">
                                <TooltipTrigger>
                                    <span role="button" tabIndex={0}>
                                        <Icon
                                            color={
                                                'var(--content-warning-primary)'
                                            }
                                            name="triangle-warning"
                                        />
                                    </span>
                                </TooltipTrigger>

                                <TooltipContent title="Gorgias does not support this metafield type." />
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
                        !isSupportedMetafieldType(
                            info.getValue() as MetafieldType,
                        )
                    }
                    type={info.getValue() as MetafieldType}
                />
            ),
        },
    ]
}
