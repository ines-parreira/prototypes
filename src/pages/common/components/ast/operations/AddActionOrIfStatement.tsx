import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {List, Map} from 'immutable'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import Errors from '../Errors'
import {RuleOperation} from '../../../../../state/rules/types'
import {RuleItemActions} from '../../../../settings/rules/types'
import Hoverable from '../../Hoverable'
import {computeLeftPadding} from '../utils.js'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    title: string
    depth: number
    removable: boolean
    hoverableClassName?: string
    empty?: boolean
}

export class AddActionOrIfStatement extends Component<Props> {
    static defaultProps: Pick<Props, 'removable'> = {
        removable: false,
    }

    static contextTypes = {
        hovered: PropTypes.bool,
    }

    _addAction = () => {
        const actionNode = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'Action',
                },
                arguments: [
                    {
                        type: 'Literal',
                        value: '',
                        raw: "''",
                    },
                    {
                        type: 'ObjectExpression',
                        properties: [],
                    },
                ],
            },
        }

        const {actions, parent} = this.props
        actions.modifyCodeAST(
            parent.push('body'),
            actionNode,
            RuleOperation.Insert
        )
    }

    _addIfStatement = () => {
        const actionNode = {
            type: 'IfStatement',
            test: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'eq',
                },
                arguments: [
                    {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'ticket',
                        },
                        property: {
                            type: 'Identifier',
                            name: 'status',
                        },
                    },
                    {
                        type: 'Literal',
                        value: 'open',
                        raw: "'open'",
                    },
                ],
            },
            consequent: {
                type: 'BlockStatement',
                body: [],
            },
        }

        const {actions, parent} = this.props
        actions.modifyCodeAST(
            parent.push('body'),
            actionNode,
            RuleOperation.Insert
        )
    }

    /**
     * Delete the current statement.
     * For now, only `else` blocks have the `removable` property and can use this method.
     */
    _deleteStatement = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, null, RuleOperation.Delete)
    }

    render() {
        const {title, depth, removable, empty} = this.props

        return (
            <UncontrolledButtonDropdown
                style={{paddingLeft: computeLeftPadding(depth)}}
                className="AddActionOrIfStatement"
            >
                <DropdownToggle
                    className="ControlStructureButton"
                    type="button"
                    caret
                >
                    {title}
                </DropdownToggle>
                {empty && <Errors inline>{title} cannot be empty</Errors>}
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
                    {removable ? (
                        <DropdownItem
                            type="button"
                            onClick={() => this._deleteStatement()}
                        >
                            <i className="material-icons red mr-1">delete</i>
                            Delete node
                        </DropdownItem>
                    ) : null}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}

export default Hoverable(AddActionOrIfStatement)
