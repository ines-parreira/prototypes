import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import {v4 as uuidv4} from 'uuid'

import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {TableColumn, TableViewColumn} from 'state/ui/stats/types'
import Button from 'pages/common/components/button/Button'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import {AgentsEditColumnsItem} from './AgentsEditColumnsItem'
import {HeaderTooltips, TableLabels} from './AgentsTableConfig'

import css from './AgentsEditColumns.less'

export const TOGGLE_LABEL = 'Edit Columns'
export const SAVE_TOOLTIP =
    'Clicking "Save" will update the table for all users.'
export const SAVE_BUTTON_TEXT = 'Save'

const dragToPosition = (
    columnsList: TableViewColumn[],
    target: {id: string},
    from: {id: string}
): TableViewColumn[] => {
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

export const AgentsEditColumns = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const {currentView, settings, submitActiveView} =
        useAgentsTableConfigSetting()

    const [columnsVisibility, setColumnsVisibility] = useState<
        TableViewColumn[]
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

    const handleChangeVisibility =
        (columnId: TableColumn) => (visibility: boolean) => {
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
        const isNewView = !settings.views.find(
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
                        <AgentsEditColumnsItem
                            key={id}
                            title={TableLabels[id]}
                            isIndeterminate={visibility === null}
                            isChecked={!!visibility}
                            disabled={id === TableColumn.AgentName}
                            onChange={handleChangeVisibility(id)}
                            tooltip={HeaderTooltips[id]?.title}
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
