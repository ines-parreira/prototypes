// @flow
import React from 'react'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import Hoverable from '../../Hoverable'
import {computeLeftPadding} from '../utils'


class AddActionOrIfStatement extends React.Component<Props> {
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

        const {actions, parent} = this.props
        actions.modifyCodeAST(parent.push('body'), actionNode, 'INSERT')
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

        const {actions, parent} = this.props
        actions.modifyCodeAST(parent.push('body'), actionNode, 'INSERT')
    }

    render() {
        const {title, depth} = this.props

        return (
            <UncontrolledButtonDropdown style={{paddingLeft: computeLeftPadding(depth)}}>
                <DropdownToggle
                    className="ControlStructureButton"
                    type="button"
                    caret
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

type Props = {
    rule: Object,
    actions: Object,
    parent: Object,
    title: string,
    depth: number
}

AddActionOrIfStatement.contextTypes = {
    hovered: React.PropTypes.bool,
}

export default Hoverable(AddActionOrIfStatement)
