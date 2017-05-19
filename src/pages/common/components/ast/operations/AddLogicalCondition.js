import React from 'react'
import {connect} from 'react-redux'
import {UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import Hoverable from '../../Hoverable'

import * as rulesSelectors from '../../../../../state/rules/selectors'

@Hoverable
@connect((state, ownProps) => {
    return {
        statementOperator: rulesSelectors.getIfStatementOperator(ownProps.rule.get('id'), ownProps.parent)(state),
    }
})
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

        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, actionNode, 'UPDATE_LOGICAL_OPERATOR')
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

        const {actions, rule, parent} = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, actionNode, 'UPDATE_LOGICAL_OPERATOR')
    }

    render() {
        const {title, statementOperator} = this.props

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
