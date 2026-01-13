import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    createSelectableColumn,
    createSortableColumn,
    Icon,
    Text,
} from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import { MAX_FIELDS_PER_CATEGORY } from '../../constants'
import type { Field } from '../../MetafieldsTable/types'
import MetafieldTypeItem from '../../MetafieldTypeItem/MetafieldTypeItem'
import { getCheckboxContent } from '../../utils/getCheckboxContent'
import { isSupportedMetafieldType } from '../../utils/isSupportedMetafieldType'
import { shouldShowLimitTooltip } from '../../utils/shouldShowLimitTooltip'
import LimitReachedTooltip from './LimitReachedTooltip'
import TypeNotSupportedTooltip from './TypeNotSupportedTooltip'

import css from './Columns.less'

const nameColumn = createSortableColumn<Field>('name', 'Name', (info) => {
    return (
        <Box gap="xxxs" minWidth="200px">
            {isSupportedMetafieldType(info.row.original.type) ? (
                <Text variant="bold">{info.getValue() as string}</Text>
            ) : (
                <Box gap="xxxs" alignItems="center">
                    <span className={css.nameColumnText}>
                        {' '}
                        <Text variant="bold">{info.getValue() as string}</Text>
                    </span>

                    <TypeNotSupportedTooltip
                        trigger={
                            <span role="button" tabIndex={0}>
                                <Icon
                                    color={'var(--content-warning-primary)'}
                                    name="triangle-warning"
                                />
                            </span>
                        }
                    />
                </Box>
            )}
        </Box>
    )
})

const typeColumn: ColumnDef<Field> = {
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
}

const baseSelectableColumn = createSelectableColumn<Field>()

export const getCheckboxColumn = (
    selectedMetafields: Field[],
    totalSelectedCount: number,
): ColumnDef<Field> => {
    const hasReachedLimit = totalSelectedCount >= MAX_FIELDS_PER_CATEGORY
    const originalCell = baseSelectableColumn.cell

    return {
        ...baseSelectableColumn,
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
                    <LimitReachedTooltip>{checkboxContent}</LimitReachedTooltip>
                )
            }

            return checkboxContent
        },
    }
}

export const staticColumns: ColumnDef<Field>[] = [nameColumn, typeColumn]
