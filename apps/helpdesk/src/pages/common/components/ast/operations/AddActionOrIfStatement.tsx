import type { List, Map } from 'immutable'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import Errors from 'pages/common/components/ast/Errors'
import { computeLeftPadding } from 'pages/common/components/ast/utils'
import type { RuleItemActions } from 'pages/settings/rules/types'
import { RuleOperation } from 'state/rules/types'

import useHoverable from '../../../hooks/useHoverable'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    parent: List<any>
    title: string
    depth: number
    removable?: boolean
    hoverableClassName?: string
    empty?: boolean
}

export default function AddActionOrIfStatement({
    title,
    depth,
    removable = false,
    empty,
    actions,
    parent,
    hoverableClassName,
}: Props) {
    const { setRef } = useHoverable()

    const addAction = () => {
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

        actions.modifyCodeAST(
            parent.push('body'),
            actionNode,
            RuleOperation.Insert,
        )
    }

    const addIfStatement = () => {
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

        actions.modifyCodeAST(
            parent.push('body'),
            actionNode,
            RuleOperation.Insert,
        )
    }

    const deleteStatement = () => {
        actions.modifyCodeAST(parent, null, RuleOperation.Delete)
    }

    return (
        <span
            className={hoverableClassName || ''}
            ref={setRef}
            style={{
                display: 'flex',
                minHeight: 32,
                alignItems: 'center',
            }}
        >
            <UncontrolledButtonDropdown
                style={{ paddingLeft: computeLeftPadding(depth) }}
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
                    <DropdownItem type="button" onClick={addAction}>
                        Action
                    </DropdownItem>
                    <DropdownItem type="button" onClick={addIfStatement}>
                        {`"IF" statement`}
                    </DropdownItem>
                    {removable ? (
                        <DropdownItem type="button" onClick={deleteStatement}>
                            <i className="material-icons red mr-1">delete</i>
                            Delete node
                        </DropdownItem>
                    ) : null}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </span>
    )
}
