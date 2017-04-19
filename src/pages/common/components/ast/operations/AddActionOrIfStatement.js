import React from 'react'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import Hoverable from '../../Hoverable'

class AddActionOrIfStatement extends React.Component {
    _addAction = () => {
        const actionNode = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'Action'
                },
                arguments: [
                    {
                        type: 'Literal',
                        value: '',
                        raw: '\'\''
                    },
                    {
                        type: 'ObjectExpression',
                        properties: []
                    }
                ]
            }
        }

        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent.push('body'), actionNode, 'INSERT')
    }

    _addIfStatement = () => {
        const actionNode = {
            type: 'IfStatement',
            test: {
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
            consequent: {
                type: 'BlockStatement',
                body: []
            },
            alternate: {
                type: 'BlockStatement',
                body: []
            }
        }

        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent.push('body'), actionNode, 'INSERT')
    }

    render() {
        const {title} = this.props

        return (
            <UncontrolledButtonDropdown>
                <DropdownToggle
                    caret
                    type="button"
                    className="mr-2"
                    color="info"
                >
                    {title}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem
                        type="button"
                        onClick={() => this._addAction()}
                    >
                        Action
                    </DropdownItem>
                    <DropdownItem
                        type="button"
                        onClick={() => this._addIfStatement()}
                    >
                        "IF" statement
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}

AddActionOrIfStatement.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired,
}

AddActionOrIfStatement.contextTypes = {
    hovered: React.PropTypes.bool,
}

export default Hoverable(AddActionOrIfStatement)
