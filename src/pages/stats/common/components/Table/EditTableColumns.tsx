import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import {Selector} from 'reselect'
import {v4 as uuidv4} from 'uuid'
import {TooltipData} from 'pages/stats/types'
import {AccountSettingTableConfig} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import useAppSelector from 'hooks/useAppSelector'
import {
    TableColumnSet,
    TableSetting,
    TableView,
    TableViewColumn,
} from 'state/ui/stats/types'
import Button from 'pages/common/components/button/Button'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import {EditColumnsItem} from 'pages/stats/common/components/Table/EditColumnsItem'

import css from 'pages/stats/common/components/Table/EditColumns.less'

export const TOGGLE_LABEL = 'Edit Columns'
export const SAVE_TOOLTIP =
    'Clicking "Save" will update the table for all users.'
export const SAVE_BUTTON_TEXT = 'Save'

const dragToPosition = <T extends TableColumnSet>(
    columnsList: TableViewColumn<T>[],
    target: {id: string},
    from: {id: string}
): TableViewColumn<T>[] => {
    const targetPosition = columnsList.findIndex(
        (column) => column.id === target.id
    )
    const fromPosition = columnsList.findIndex(
        (column) => column.id === from.id
    )

    const newList = [...columnsList]
    newList.splice(targetPosition, 0, newList.splice(fromPosition, 1)[0])

    return newList
}

export const EditTableColumns = <T extends TableColumnSet>({
    settingsSelector,
    fallbackViews,
    tableLabels,
    useTableSetting,
    tooltips,
    leadColumn,
}: {
    settingsSelector: Selector<
        RootState,
        AccountSettingTableConfig<T> | undefined
    >
    fallbackViews: TableSetting<T>
    tableLabels: Record<T, string>
    tooltips: Record<T, {hint: TooltipData | null}>
    leadColumn: T
    useTableSetting: () => {
        currentView: TableView<T>
        submitActiveView: (
            activeView: TableView<T>
        ) => Promise<ReturnType<StoreDispatch>>
    }
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const settings = useAppSelector(settingsSelector)
    const currentSettings = settings ? settings.data : fallbackViews

    const {currentView, submitActiveView} = useTableSetting()

    const [columnsVisibility, setColumnsVisibility] = useState<
        TableViewColumn<T>[]
    >(currentView.metrics)

    useEffect(() => {
        if (columnsVisibility.length !== currentView.metrics.length) {
            setColumnsVisibility(currentView.metrics)
        }
    }, [
        columnsVisibility.length,
        currentView.metrics,
        currentView.metrics.length,
    ])

    const toggle = () => setDropdownOpen((prevState) => !prevState)

    const closeDropdown = () => {
        setColumnsVisibility(currentView.metrics)
        setHasChanges(false)
        setDropdownOpen(false)
    }

    const handleChangeVisibility = (columnId: T) => (visibility: boolean) => {
        setColumnsVisibility((prevValue) =>
            prevValue.map((item) => {
                if (item.id === columnId) {
                    return {
                        ...item,
                        visibility,
                    }
                }
                return item
            })
        )
        setHasChanges(true)
    }

    const dropBefore = (item: {id: string}, from: {id: string}) => {
        setColumnsVisibility((prevState) =>
            dragToPosition(prevState, item, from)
        )
        setHasChanges(true)
        return from
    }

    const handleSave = async () => {
        const isNewView = !currentSettings.views.find(
            (view) => view.id === currentView.id
        )

        await submitActiveView({
            ...(hasChanges && isNewView
                ? {
                      id: uuidv4(),
                      name: '',
                  }
                : currentView),
            metrics: columnsVisibility,
        })

        setHasChanges(false)
        closeDropdown()
    }

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
                <div className={css.dropdownMenuContainer}>
                    {columnsVisibility.map(({id, visibility}) => (
                        <EditColumnsItem
                            key={id}
                            title={tableLabels[id]}
                            isIndeterminate={visibility === null}
                            isChecked={!!visibility}
                            disabled={id === leadColumn}
                            onChange={handleChangeVisibility(id)}
                            tooltip={tooltips[id]?.hint?.title}
                            onDrop={dropBefore}
                            option={{id}}
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
