import React from 'react'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import Hoverable from '../../Hoverable'

class AddLogicalAndCondition extends React.Component {
    _handleClick = () => {
        const actionNode = {
            type: 'LogicalExpression',
            operator: '&&',
            left: null,
            right: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'eq'
                },
                arguments: [
                    {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'ticket'
                        },
                        property: {
                            type: 'Identifier',
                            name: 'status'
                        }
                    },
                    {
                        type: 'Literal',
                        value: 'open',
                        raw: '\'open\''
                    }
                ],
            },
        }

        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, actionNode, 'UPDATE_LOGICAL_AND')
    }

    render() {
        const {title} = this.props

        return (
            <UncontrolledButtonDropdown>
                <DropdownToggle
                    caret
                    type="button"
                    color="info"
                >
                    {title}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem
                        type="button"
                        onClick={() => this._handleClick()}
                    >
                        Add condition
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}

AddLogicalAndCondition.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired,
}

AddLogicalAndCondition.contextTypes = {
    hovered: React.PropTypes.bool,
}

export default Hoverable(AddLogicalAndCondition)
