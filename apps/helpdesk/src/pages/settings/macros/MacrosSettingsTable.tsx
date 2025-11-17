import type { ComponentProps } from 'react'
import { useCallback, useMemo } from 'react'

import { useRouteMatch } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'
import type { ListMacrosParams, Macro } from '@gorgias/helpdesk-queries'

import { DateAndTimeFormatting } from 'constants/datetime'
import { useBulkArchiveMacros, useBulkUnarchiveMacros } from 'hooks/macros'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { OrderDirection } from 'models/api/types'
import { MacroSortableProperties } from 'models/macro/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import CheckBoxField from 'pages/common/forms/CheckBoxField'

import { MacrosSettingsItem } from './MacrosSettingsItem'

import css from './MacrosSettingsTable.less'

type Props = {
    isLoading: boolean
    macros?: Macro[]
    onSortOptionsChange: (
        orderBy: MacroSortableProperties,
        orderDir: OrderDirection,
    ) => void
    options: ListMacrosParams
} & Pick<
    ComponentProps<typeof MacrosSettingsItem>,
    | 'onMacroDelete'
    | 'onMacroDuplicate'
    | 'onMacroArchiveOrUnarchived'
    | 'selectedMacrosIds'
    | 'setSelectedMacrosIds'
>

export function MacrosSettingsTable({
    isLoading,
    macros,
    onSortOptionsChange,
    onMacroDelete,
    onMacroDuplicate,
    onMacroArchiveOrUnarchived,
    options,
    selectedMacrosIds,
    setSelectedMacrosIds,
}: Props) {
    const isArchiveTab = !!useRouteMatch('/app/settings/macros/archived')

    const selectedMacrosLength = useMemo(
        () => selectedMacrosIds.length,
        [selectedMacrosIds],
    )
    const isAllSelected = useMemo(
        () =>
            !isLoading &&
            !!selectedMacrosLength &&
            selectedMacrosLength === macros?.length,
        [isLoading, macros?.length, selectedMacrosLength],
    )
    const orderByValue = useMemo(
        () => options.order_by?.split(':')[0],
        [options.order_by],
    )
    const orderDirValue = useMemo(
        () => options.order_by?.split(':')[1] as OrderDirection,
        [options.order_by],
    )
    const hasAgentPrivileges = useHasAgentPrivileges()
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    const defaultDescendingSort = [
        MacroSortableProperties.Usage,
        MacroSortableProperties.UpdatedDatetime,
    ]

    const handleSortChange = (orderBy: MacroSortableProperties) => {
        onSortOptionsChange(
            orderBy,
            orderBy === orderByValue
                ? orderDirValue === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
                : defaultDescendingSort.includes(orderBy)
                  ? OrderDirection.Desc
                  : OrderDirection.Asc,
        )
    }

    const { mutate: bulkUnarchiveMacros } = useBulkUnarchiveMacros()
    const { mutate: bulkArchiveMacros } = useBulkArchiveMacros(macros)

    const onBulkArchiveOrUnarchive = () => {
        if (isArchiveTab) {
            bulkUnarchiveMacros({ data: { ids: selectedMacrosIds } })
        } else {
            bulkArchiveMacros({ data: { ids: selectedMacrosIds } })
        }

        setSelectedMacrosIds([])
    }

    const checkboxAllLabel = useMemo(
        () =>
            !!selectedMacrosLength
                ? `${selectedMacrosLength} macro${selectedMacrosLength > 1 ? 's' : ''} selected`
                : 'No macros selected',
        [selectedMacrosLength],
    )

    const onChange = useCallback(
        () =>
            !!selectedMacrosLength
                ? setSelectedMacrosIds([])
                : setSelectedMacrosIds(
                      macros ? macros.map(({ id }) => id!) : [],
                  ),
        [macros, selectedMacrosLength, setSelectedMacrosIds],
    )

    const isDisabled = useMemo(
        () => isLoading || (!isAllSelected && !selectedMacrosLength),
        [isAllSelected, isLoading, selectedMacrosLength],
    )

    return (
        <TableWrapper>
            <thead className={css.tableHead}>
                <tr>
                    <HeaderCellProperty
                        titleClassName={css.headerCellProperty}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue === MacroSortableProperties.Name
                        }
                        onClick={() =>
                            handleSortChange(MacroSortableProperties.Name)
                        }
                        title="Macro"
                    />
                    <HeaderCellProperty
                        titleClassName={css.headerCellProperty}
                        title="Tags"
                    />
                    <HeaderCellProperty
                        titleClassName={css.headerCellProperty}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue === MacroSortableProperties.Language
                        }
                        onClick={() =>
                            handleSortChange(MacroSortableProperties.Language)
                        }
                        title="Language"
                    />
                    <HeaderCellProperty
                        titleClassName={css.headerCellProperty}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue === MacroSortableProperties.Usage
                        }
                        onClick={() =>
                            handleSortChange(MacroSortableProperties.Usage)
                        }
                        title="Usage count"
                    />
                    <HeaderCellProperty
                        titleClassName={css.headerCellProperty}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue ===
                            MacroSortableProperties.UpdatedDatetime
                        }
                        onClick={() =>
                            handleSortChange(
                                MacroSortableProperties.UpdatedDatetime,
                            )
                        }
                        title="Last updated"
                    />
                    <HeaderCell />
                </tr>
                <tr>
                    <HeaderCell className={css.actionsHeader}>
                        <CheckBoxField
                            className={css.checkboxAll}
                            inputClassName={css.checkboxAllInput}
                            label={checkboxAllLabel}
                            name="Select all"
                            aria-label="Select all"
                            value={isAllSelected}
                            isIndeterminate={
                                !!selectedMacrosLength &&
                                !!macros?.length &&
                                selectedMacrosLength < macros?.length
                            }
                            onChange={onChange}
                        />
                        <Button
                            aria-label={isArchiveTab ? 'Unarchive' : 'Archive'}
                            intent="secondary"
                            fillStyle="ghost"
                            isDisabled={isDisabled}
                            onClick={onBulkArchiveOrUnarchive}
                            size="small"
                        >
                            <ButtonIconLabel
                                icon={isArchiveTab ? 'unarchive' : 'archive'}
                            >
                                {isArchiveTab ? 'Unarchive' : 'Archive'}
                            </ButtonIconLabel>
                        </Button>
                    </HeaderCell>
                    <HeaderCell />
                    <HeaderCell />
                    <HeaderCell />
                    <HeaderCell />
                    <HeaderCell />
                </tr>
            </thead>
            <TableBody>
                {isLoading ? (
                    <TableBodyRow>
                        <BodyCell innerClassName={css.spinner} colSpan={6}>
                            <LoadingSpinner size="medium" />
                        </BodyCell>
                    </TableBodyRow>
                ) : !macros ? null : (
                    <>
                        {macros.map((macro) => (
                            <MacrosSettingsItem
                                key={macro.id}
                                datetimeFormat={datetimeFormat}
                                hasAgentPrivileges={hasAgentPrivileges}
                                macro={macro}
                                onMacroDelete={onMacroDelete}
                                onMacroDuplicate={onMacroDuplicate}
                                onMacroArchiveOrUnarchived={
                                    onMacroArchiveOrUnarchived
                                }
                                firstTagFilter={options.tags?.[0]}
                                selectedMacrosIds={selectedMacrosIds}
                                setSelectedMacrosIds={setSelectedMacrosIds}
                            />
                        ))}
                    </>
                )}
            </TableBody>
        </TableWrapper>
    )
}

export default MacrosSettingsTable
