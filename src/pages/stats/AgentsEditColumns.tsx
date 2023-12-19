import React, {useState} from 'react'
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

export const AgentsEditColumns = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const {currentView, settings, submitActiveView} =
        useAgentsTableConfigSetting()

    const [columnsVisibility, setColumnsVisibility] = useState<
        TableViewColumn[]
    >(currentView.metrics)

    const toggle = () => setDropdownOpen((prevState) => !prevState)

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
        toggle()
    }

    const closeDropdown = () => {
        setColumnsVisibility(currentView.metrics)
        toggle()
    }

    return (
        <Dropdown isOpen={dropdownOpen} toggle={closeDropdown}>
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
                            Save
                        </Button>
                    </div>
                </div>
            </DropdownMenu>
        </Dropdown>
    )
}
