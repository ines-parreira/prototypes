import React from 'react'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button} from 'reactstrap'

import Hoverable from '../../Hoverable'

@Hoverable
export default class AddLogicalCondition extends React.Component {
    static propTypes = {
        rule: React.PropTypes.object.isRequired,
        actions: React.PropTypes.object.isRequired,
        parent: React.PropTypes.object.isRequired,
        statementOperator: React.PropTypes.string,
        title: React.PropTypes.string.isRequired,
    }

    static contextTypes = {
        hovered: React.PropTypes.bool,
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

        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, actionNode, 'UPDATE_LOGICAL_OPERATOR')
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

        const {actions, parent} = this.props
        actions.modifyCodeAST(parent, actionNode, 'UPDATE_LOGICAL_OPERATOR')
    }

    render() {
        const {title, actions, parent} = this.props

        // return operator of first test operator
        // '&&' if first operator is an AND, '||' if it is a OR and null if there is no operator
        // (test with only one condition)
        const condition = actions.getCondition(parent)
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
                    caret
                    type="button"
                    color="info"
                    className="mr-1"
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
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        )
    }
}
