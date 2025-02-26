import React, { useState } from 'react'

import classNames from 'classnames'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'
import { Selector } from 'reselect'
import { v4 as uuidv4 } from 'uuid'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import useDeepEffect from 'hooks/useDeepEffect'
import Button from 'pages/common/components/button/Button'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import css from 'pages/stats/common/components/Table/EditColumns.less'
import { EditColumnsItem } from 'pages/stats/common/components/Table/EditColumnsItem'
import { TooltipData } from 'pages/stats/types'
import { AccountSettingTableConfig } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import {
    TableColumnSet,
    TableRowSet,
    TableSetting,
    TableView,
    TableViewItem,
} from 'state/ui/stats/types'

export const TOGGLE_LABEL = 'Edit Columns'
export const SAVE_TOOLTIP =
    'Clicking "Save" will update the table for all users.'
export const SAVE_BUTTON_TEXT = 'Save'

const dragToPosition = <T extends TableColumnSet | TableRowSet>(
    columnsList: TableViewItem<T>[],
    target: { id: string },
    from: { id: string },
): TableViewItem<T>[] => {
    const targetPosition = columnsList.findIndex(
        (column) => column.id === target.id,
    )
    const fromPosition = columnsList.findIndex(
        (column) => column.id === from.id,
    )

    const newList = [...columnsList]
    newList.splice(targetPosition, 0, newList.splice(fromPosition, 1)[0])

    return newList
}

export const EditTableColumns = <
    T extends TableColumnSet,
    R extends TableRowSet,
>({
    settingsSelector,
    fallbackViews,
    tableLabels,
    rowLabels,
    useTableSetting,
    tooltips,
    rowTooltips,
    leadColumn,
}: {
    settingsSelector: Selector<
        RootState,
        AccountSettingTableConfig<T, R> | undefined
    >
    fallbackViews: TableSetting<T, R>
    tableLabels: Record<T, string>
    rowLabels?: Record<R, string>
    tooltips: Record<T, { hint: TooltipData | null }>
    rowTooltips?: Record<R, { hint: TooltipData | null }>
    leadColumn: T
    leadRow?: R
    useTableSetting: () => {
        currentView: TableView<T, R>
        submitActiveView: (
            activeView: TableView<T, R>,
        ) => Promise<ReturnType<StoreDispatch>> | Promise<boolean>
    }
}) => {
    const isReportingAgentsTableAverageAndTotalEnabled = useFlag(
        FeatureFlagKey.ReportingAgentsTableAverageAndTotal,
    )
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const settings = useAppSelector(settingsSelector)
    const currentSettings = settings ? settings.data : fallbackViews

    const { currentView, submitActiveView } = useTableSetting()

    const [columnsVisibility, setColumnsVisibility] = useState<
        TableViewItem<T>[]
    >(currentView.metrics)
    const [rowsVisibility, setRowsVisibility] = useState<TableViewItem<R>[]>(
        currentView.rows ?? [],
    )

    useDeepEffect(() => {
        setColumnsVisibility(currentView.metrics)
    }, [currentView.metrics])

    useDeepEffect(() => {
        setRowsVisibility(currentView.rows ?? [])
    }, [currentView.rows])

    const toggle = () => setDropdownOpen((prevState) => !prevState)

    const closeDropdown = () => {
        setColumnsVisibility(currentView.metrics)
        setRowsVisibility(currentView.rows ?? [])
        setHasChanges(false)
        setDropdownOpen(false)
    }

    const handleChangeColumnVisibility =
        (columnId: T) => (visibility: boolean) => {
            setColumnsVisibility((prevValue) =>
                prevValue.map((item) => {
                    if (item.id === columnId) {
                        return {
                            ...item,
                            visibility,
                        }
                    }
                    return item
                }),
            )
            setHasChanges(true)
        }

    const handleChangeRowVisibility = (rowId: R) => (visibility: boolean) => {
        setRowsVisibility((prevValue) =>
            prevValue.map((item) => {
                if (item.id === rowId) {
                    return {
                        ...item,
                        visibility,
                    }
                }
                return item
            }),
        )
        setHasChanges(true)
    }

    const dropBeforeColumn = (item: { id: string }, from: { id: string }) => {
        setColumnsVisibility((prevState) =>
            dragToPosition(prevState, item, from),
        )
        setHasChanges(true)
        return from
    }

    const dropBeforeRow = (item: { id: string }, from: { id: string }) => {
        setRowsVisibility((prevState) => dragToPosition(prevState, item, from))
        setHasChanges(true)
        return from
    }

    const handleSave = async () => {
        const isNewView = !currentSettings.views.find(
            (view) => view.id === currentView.id,
        )

        setIsLoading(true)

        await submitActiveView({
            ...(hasChanges && isNewView
                ? {
                      id: uuidv4(),
                      name: '',
                  }
                : currentView),
            metrics: columnsVisibility,
            ...(hasRows ? { rows: rowsVisibility } : {}),
        })

        setIsLoading(false)

        setHasChanges(false)
        closeDropdown()
    }

    const hasRows =
        isReportingAgentsTableAverageAndTotalEnabled &&
        rowsVisibility.length > 0
    return (
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle
                tag="span"
                className={classNames(css.dropdownToggle, {
                    [css.active]: dropdownOpen,
                })}
            >
                <i className="icon material-icons md-2">view_column</i>
                {TOGGLE_LABEL}
            </DropdownToggle>

            <DropdownMenu className={css.dropdownMenu}>
                {hasRows && (
                    <div className={css.dropdownMenuContainer}>
                        <div>Edit rows</div>
                        {rowsVisibility.map(({ id, visibility }) => (
                            <EditColumnsItem
                                key={id}
                                title={rowLabels?.[id] ?? ''}
                                isIndeterminate={visibility === null}
                                isChecked={!!visibility}
                                onChange={handleChangeRowVisibility(id)}
                                tooltip={rowTooltips?.[id]?.hint?.title ?? ''}
                                onDrop={dropBeforeRow}
                                option={{ id }}
                            />
                        ))}
                    </div>
                )}
                <div className={css.dropdownMenuContainer}>
                    {hasRows && <div>Edit columns</div>}
                    {columnsVisibility.map(({ id, visibility }) => (
                        <EditColumnsItem
                            key={id}
                            title={tableLabels[id]}
                            isIndeterminate={visibility === null}
                            isChecked={!!visibility}
                            disabled={id === leadColumn}
                            onChange={handleChangeColumnVisibility(id)}
                            tooltip={tooltips[id]?.hint?.title}
                            onDrop={dropBeforeColumn}
                            option={{ id }}
                        />
                    ))}
                </div>
                <div className={css.dropdownFooter}>
                    <Button intent="secondary" onClick={closeDropdown}>
                        Cancel
                    </Button>
                    <div className={css.dropdownFooterSave}>
                        <IconTooltip>{SAVE_TOOLTIP}</IconTooltip>
                        <Button
                            intent="primary"
                            isDisabled={!hasChanges}
                            isLoading={isLoading}
                            onClick={handleSave}
                        >
                            {SAVE_BUTTON_TEXT}
                        </Button>
                    </div>
                </div>
            </DropdownMenu>
        </Dropdown>
    )
}
