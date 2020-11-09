import React, {ComponentType} from 'react'
import PropTypes from 'prop-types'
import {List, Map} from 'immutable'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
} from 'reactstrap'

import {RuleOperation} from '../../../../../state/rules/types'
import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import Hoverable from '../../Hoverable.js'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    title: string
    hoverableClassName: string
}

export class AddLogicalCondition extends React.Component<Props> {
    static contextTypes = {
        hovered: PropTypes.bool,
    }

    _handleAndClick = () => {
        const actionNode = {
            type: 'LogicalExpression',
            operator: '&&',
            left: null,
            right: {
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
        }

        const {actions, parent} = this.props
        actions.modifyCodeAST(
            parent,
            actionNode,
            RuleOperation.UpdateLogicalOperator
        )
    }

    _handleOrClick = () => {
        const actionNode = {
            type: 'LogicalExpression',
            operator: '||',
            left: null,
            right: {
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
        }

        const {actions, parent} = this.props
        actions.modifyCodeAST(
            parent,
            actionNode,
            RuleOperation.UpdateLogicalOperator
        )
    }

    /**
     * Add an `else` block to the current `if` statement
     */
    _handleElseClick = () => {
        const actionNode = {
            alternate: {
                type: 'BlockStatement',
                body: [],
            },
        }

        const {actions, parent} = this.props
        actions.modifyCodeAST(
            parent.pop(),
            actionNode,
            RuleOperation.UpdateIfStatement
        )
    }

    /**
     * Delete the current `if` statement
     */
    _deleteIfStatement = () => {
        const {actions, parent} = this.props
        actions.modifyCodeAST(parent.pop(), null, RuleOperation.Delete)
    }

    render() {
        const {title, actions, parent} = this.props

        // return operator of first test operator
        // '&&' if first operator is an AND, '||' if it is a OR and null if there is no operator
        // (test with only one condition)
        const condition = actions.getCondition(parent)
        const ifStatement = actions.getCondition(parent.pop())
        const statementOperator = condition.get('operator') || null

        // if there is no condition, display a button that will create it
        if (condition.isEmpty()) {
            return (
                <Button
                    type="button"
                    color="info"
                    className="mr-1"
                    onClick={() => this._handleAndClick()}
                >
                    {title}
                </Button>
            )
        }

        return (
            <UncontrolledButtonDropdown>
                <DropdownToggle
                    className="ControlStructureButton"
                    type="button"
                    caret
                >
                    {title}
                </DropdownToggle>
                <DropdownMenu>
                    {
                        // allow AND only if no operator in IF or if already &&
                        (!statementOperator || statementOperator === '&&') && (
                            <DropdownItem
                                type="button"
                                onClick={() => this._handleAndClick()}
                            >
                                Add <b>AND</b> condition
                            </DropdownItem>
                        )
                    }
                    {
                        // allow OR only if no operator in IF or if already ||
                        (!statementOperator || statementOperator === '||') && (
                            <DropdownItem
                                type="button"
                                onClick={() => this._handleOrClick()}
                            >
                                Add <b>OR</b> condition
                            </DropdownItem>
                        )
                    }
                    {
                        // allow ELSE only if there is no `else` yet in the if statement
                        !ifStatement.get('alternate') && (
                            <DropdownItem
                                type="button"
                                onClick={() => this._handleElseClick()}
                            >
                                Add <b>ELSE</b> statement
                            </DropdownItem>
                        )
                    }
                    <DropdownItem
                        type="button"
                        onClick={() => this._deleteIfStatement()}
                    >
                        <i className="material-icons red mr-1">delete</i>
                        Delete node
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}

export default Hoverable(AddLogicalCondition) as ComponentType<Props>
