import React from 'react'
import {Map, List} from 'immutable'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {RuleOperation} from '../../../../../state/rules/types'
import {RuleItemActions} from '../../../../settings/rules/types'

import {actionsConfig} from './Action'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    value: string
}

export default class ActionSelect extends React.Component<Props> {
    _handleClick = (value: string) => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, value, RuleOperation.Update)
    }

    render() {
        const {value, rule} = this.props
        const selectedActionName =
            actionsConfig[value] && actionsConfig[value].name

        const label = selectedActionName || value || 'Select action'

        return (
            <UncontrolledButtonDropdown className="ActionSelect">
                <DropdownToggle className="mr-1" type="button" caret>
                    {label}
                </DropdownToggle>
                <DropdownMenu>
                    {Object.keys(actionsConfig).map((action, i) => {
                        const config = actionsConfig[action] || {}

                        if (
                            config.type === 'system' &&
                            !(rule.get('type') === 'system')
                        ) {
                            return null
                        }

                        return (
                            <DropdownItem
                                key={i}
                                type="button"
                                onClick={() => this._handleClick(action)}
                            >
                                {config.name || action}
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}
