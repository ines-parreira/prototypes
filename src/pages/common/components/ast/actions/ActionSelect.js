import React from 'react'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {actionsConfig} from './Action'

class ActionSelect extends React.Component {
    _handleClick = (value) => {
        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, value, 'UPDATE')
    }

    render() {
        const {value, rule} = this.props
        const selectedActionName = actionsConfig[value] && actionsConfig[value].name

        const label = selectedActionName || value || 'Select action'

        return (
            <UncontrolledButtonDropdown>
                <DropdownToggle
                    caret
                    className="mr-2"
                    color="success"
                    type="button"
                >
                    {label}
                </DropdownToggle>
                <DropdownMenu>
                    {
                        Object.keys(actionsConfig).map((action, i) => {
                            const config = actionsConfig[action] || {}

                            if (config.type === 'system' && !(rule.get('type') === 'system')) {
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
                        })
                    }
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }

}

ActionSelect.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
}

export default ActionSelect
