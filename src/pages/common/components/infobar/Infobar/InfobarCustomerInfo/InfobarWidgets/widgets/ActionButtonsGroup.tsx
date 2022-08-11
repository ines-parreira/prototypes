import React, {useContext, useState} from 'react'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'

import {EditionContext} from 'providers/infobar/EditionContext'
import Group from 'pages/common/components/layout/Group'
import IconButton from 'pages/common/components/button/IconButton'

import ActionButton from './ActionButton'
import css from './ActionButtons.less'

import {InfobarAction} from './types'

type Props = {
    actions: InfobarAction[]
    payload: Record<string, unknown> // the arguments which need to be passed to execute any action
}

// The maximum number of actions we can display before adding the dropdown
const NB_ACTIONS_DISPLAYED = 3

function ActionButtonsGroup({actions, payload}: Props) {
    const {isEditing} = useContext(EditionContext)
    const [isModalOpen, setModalOpen] = useState(false)
    const [isActionDropdownOpen, setActionDropdownOpen] = useState(false)

    const toggleDropdown = () => {
        if (!isModalOpen) {
            setActionDropdownOpen(!isActionDropdownOpen)
        }
    }

    if (!actions.length || isEditing) {
        return null
    }

    const buttons = actions.slice(0, NB_ACTIONS_DISPLAYED)
    const dropdownButtons = actions.slice(NB_ACTIONS_DISPLAYED)
    return (
        <Group className={css.container}>
            {buttons.map((action) => {
                return (
                    <ActionButton
                        key={action.key}
                        options={action.options}
                        payload={payload}
                        popover={action.popover}
                        title={action.title}
                        modal={action.modal}
                        modalData={action.modalData}
                        setModalOpen={setModalOpen}
                    >
                        {action.child}
                    </ActionButton>
                )
            })}
            {dropdownButtons.length > 0 && (
                <Dropdown isOpen={isActionDropdownOpen} toggle={toggleDropdown}>
                    <DropdownToggle tag="span">
                        <IconButton size="small" intent="secondary">
                            more_horiz
                        </IconButton>
                    </DropdownToggle>
                    <DropdownMenu right>
                        {dropdownButtons.map((action) => {
                            return (
                                <ActionButton
                                    key={action.key}
                                    options={action.options}
                                    payload={payload}
                                    tag={DropdownItem}
                                    tagOptions={{
                                        toggle: false,
                                        className: css.dropdownItem,
                                    }}
                                    popover={action.popover}
                                    title={action.title}
                                    modal={action.modal}
                                    modalData={action.modalData}
                                    setModalOpen={setModalOpen}
                                >
                                    {action.child}
                                </ActionButton>
                            )
                        })}
                    </DropdownMenu>
                </Dropdown>
            )}
        </Group>
    )
}

export default ActionButtonsGroup
