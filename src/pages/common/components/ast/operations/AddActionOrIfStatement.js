// @flow
import React from 'react'
import type {List} from 'immutable'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import Hoverable from '../../Hoverable'
import {computeLeftPadding} from '../utils'


export class AddActionOrIfStatement extends React.Component<Props> {
    static defaultProps = {
        removable: false
    }

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
        }

        const {actions, parent} = this.props
        actions.modifyCodeAST(parent.push('body'), actionNode, 'INSERT')
    }

    /**
     * Delete the current statement.
     * For now, only `else` blocks have the `removable` property and can use this method.
     */
    _deleteStatement = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, null, 'DELETE')
    }

    render() {
        const {title, depth, removable} = this.props

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
                    {
                        removable ? (
                            <DropdownItem
                                type="button"
                                onClick={() => this._deleteStatement()}
                            >
                                <i className="material-icons red mr-1">delete</i>
                                Delete node
                            </DropdownItem>
                        ) : null
                    }
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}

type Props = {
    rule: Object,
    actions: Object,
    parent: List<*>,
    title: string,
    depth: number,
    removable: boolean
}

AddActionOrIfStatement.contextTypes = {
    hovered: React.PropTypes.bool,
}

export default Hoverable(AddActionOrIfStatement)
