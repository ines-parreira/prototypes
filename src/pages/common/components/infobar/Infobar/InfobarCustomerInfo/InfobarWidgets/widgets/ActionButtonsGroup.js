// @flow
import React from 'react'
import {
    ButtonDropdown,
    ButtonGroup,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import ActionButton from './ActionButton.tsx'

import type {ActionType} from './types'

type Props = {
    actions: Array<ActionType>,
    payload: Object, // the arguments which need to be passed to execute any action
}

type State = {
    actionDropdownIsOpen: boolean,
}

// The maximum number of actions we can display before adding the dropdown
const NB_ACTIONS_DISPLAYED = 3

export default class ActionButtonsGroup extends React.Component<Props, State> {
    state = {
        actionDropdownIsOpen: false,
    }

    render() {
        const {actions, payload} = this.props

        const {actionDropdownIsOpen} = this.state

        if (!actions.length) {
            return null
        }

        const buttons = actions.slice(0, NB_ACTIONS_DISPLAYED)
        const dropdownOptions = actions.slice(NB_ACTIONS_DISPLAYED)

        return (
            <ButtonGroup className="action-buttons">
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
                        >
                            {action.child}
                        </ActionButton>
                    )
                })}
                {dropdownOptions.length > 0 && (
                    <ButtonDropdown
                        className="action-dropdown"
                        isOpen={actionDropdownIsOpen}
                        toggle={() =>
                            this.setState({
                                actionDropdownIsOpen: !actionDropdownIsOpen,
                            })
                        }
                    >
                        <DropdownToggle
                            caret
                            className="caret-only"
                            type="button"
                            color="secondary"
                            size="sm"
                        />
                        <DropdownMenu right>
                            {dropdownOptions.map((action) => {
                                return (
                                    <ActionButton
                                        key={action.key}
                                        options={action.options}
                                        payload={payload}
                                        tag={DropdownItem}
                                        tagOptions={{toggle: false}}
                                        popover={action.popover}
                                        title={action.title}
                                        modal={action.modal}
                                        modalData={action.modalData}
                                    >
                                        {action.child}
                                    </ActionButton>
                                )
                            })}
                        </DropdownMenu>
                    </ButtonDropdown>
                )}
            </ButtonGroup>
        )
    }
}
