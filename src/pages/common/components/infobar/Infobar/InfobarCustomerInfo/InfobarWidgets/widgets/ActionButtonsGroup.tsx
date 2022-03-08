import React from 'react'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'

import Group from 'pages/common/components/layout/Group'
import GroupItem from 'pages/common/components/layout/GroupItem'
import IconButton from 'pages/common/components/button/IconButton'
import {ButtonIntent} from 'pages/common/components/button/Button'
import ActionButton from './ActionButton'
import css from './ActionButtons.less'

import {InfobarAction} from './types'

type Props = {
    actions: InfobarAction[]
    payload: Record<string, unknown> // the arguments which need to be passed to execute any action
}

type State = {
    actionDropdownIsOpen: boolean
    hasModalOpen: boolean
}

// The maximum number of actions we can display before adding the dropdown
const NB_ACTIONS_DISPLAYED = 3

export default class ActionButtonsGroup extends React.Component<Props, State> {
    state = {
        actionDropdownIsOpen: false,
        hasModalOpen: false,
    }

    toggleDropdown = () => {
        if (!this.state.hasModalOpen) {
            this.setState({
                actionDropdownIsOpen: !this.state.actionDropdownIsOpen,
            })
        }
    }
    setModalOpen = (hasModalOpen: boolean) => {
        this.setState({hasModalOpen})
    }

    render() {
        const {actions, payload} = this.props
        const {actionDropdownIsOpen} = this.state

        if (!actions.length) {
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
                            setModalOpen={this.setModalOpen}
                        >
                            {action.child}
                        </ActionButton>
                    )
                })}
                {dropdownButtons.length > 0 && (
                    <GroupItem>
                        {(appendPosition) => (
                            <Dropdown
                                isOpen={actionDropdownIsOpen}
                                toggle={this.toggleDropdown}
                            >
                                <DropdownToggle tag="span">
                                    <IconButton
                                        appendPosition={appendPosition}
                                        intent={ButtonIntent.Secondary}
                                    >
                                        arrow_drop_down
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
                                                    className: css.buttonFlex,
                                                }}
                                                popover={action.popover}
                                                title={action.title}
                                                modal={action.modal}
                                                modalData={action.modalData}
                                                setModalOpen={this.setModalOpen}
                                            >
                                                {action.child}
                                            </ActionButton>
                                        )
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </GroupItem>
                )}
            </Group>
        )
    }
}
