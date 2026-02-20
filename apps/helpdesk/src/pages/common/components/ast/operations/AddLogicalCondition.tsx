import type { List, Map } from 'immutable'
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import { RuleOperation } from '../../../../../state/rules/types'
import type { RuleItemActions } from '../../../../settings/rules/types'
import useHoverable from '../../../hooks/useHoverable'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    title: string
    hoverableClassName: string
}

export default function AddLogicalCondition({
    title,
    actions,
    parent,
    hoverableClassName,
}: Props) {
    const { setRef } = useHoverable()

    const handleAndClick = () => {
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

        actions.modifyCodeAST(
            parent,
            actionNode,
            RuleOperation.UpdateLogicalOperator,
        )
    }

    const handleOrClick = () => {
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

        actions.modifyCodeAST(
            parent,
            actionNode,
            RuleOperation.UpdateLogicalOperator,
        )
    }

    const handleElseClick = () => {
        const actionNode = {
            alternate: {
                type: 'BlockStatement',
                body: [],
            },
        }

        actions.modifyCodeAST(
            parent.pop(),
            actionNode,
            RuleOperation.UpdateIfStatement,
        )
    }

    const deleteIfStatement = () => {
        actions.modifyCodeAST(parent.pop(), null, RuleOperation.Delete)
    }

    const condition = actions.getCondition(parent)
    const ifStatement = actions.getCondition(parent.pop())
    const statementOperator = condition.get('operator') || null

    if (condition.isEmpty()) {
        return (
            <Button
                type="button"
                color="info"
                className="mr-1"
                onClick={handleAndClick}
            >
                {title}
            </Button>
        )
    }

    return (
        <span
            className={hoverableClassName || ''}
            ref={setRef}
            style={{ minHeight: 32, alignItems: 'center' }}
        >
            <UncontrolledButtonDropdown>
                <DropdownToggle
                    className="ControlStructureButton"
                    type="button"
                    caret
                >
                    {title}
                </DropdownToggle>
                <DropdownMenu>
                    {(!statementOperator || statementOperator === '&&') && (
                        <DropdownItem type="button" onClick={handleAndClick}>
                            Add <b>AND</b> condition
                        </DropdownItem>
                    )}
                    {(!statementOperator || statementOperator === '||') && (
                        <DropdownItem type="button" onClick={handleOrClick}>
                            Add <b>OR</b> condition
                        </DropdownItem>
                    )}
                    {!ifStatement.get('alternate') && (
                        <DropdownItem type="button" onClick={handleElseClick}>
                            Add <b>ELSE</b> statement
                        </DropdownItem>
                    )}
                    <DropdownItem type="button" onClick={deleteIfStatement}>
                        <i className="material-icons red mr-1">delete</i>
                        Delete node
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </span>
    )
}
