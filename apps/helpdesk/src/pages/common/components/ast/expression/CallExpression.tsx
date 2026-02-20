import type { ComponentProps } from 'react'

import type { Map } from 'immutable'
import { List } from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import Action from 'pages/common/components/ast/actions/Action'
import {
    actionsConfig,
    isValidActionKey,
} from 'pages/common/components/ast/actions/config'
import ObjectExpression from 'pages/common/components/ast/expression/ObjectExpression'
import DeleteBinaryExpression from 'pages/common/components/ast/operations/DeleteBinaryExpression'
import { getSyntaxTreeLeaves } from 'pages/common/components/ast/utils'
import useHoverable from 'pages/common/hooks/useHoverable'
import { useRuleContext } from 'pages/common/hooks/useRuleContext'
import type { RuleItemActions } from 'pages/settings/rules/types'
import { OBJECT_DEFINITIONS } from 'state/rules/constants'
import type { ObjectExpressionPropertyKey } from 'state/rules/types'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    arguments: any[]
    callee: ObjectExpressionPropertyKey
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}

export default function CallExpression({
    actions,
    callee,
    rule,
    parent,
    schemas,
    depth,
    arguments: funcArgs,
}: Props) {
    const { hovered, setRef } = useHoverable()
    const { Expression } = useRuleContext()

    const parentCallee = parent.push('callee')
    const isConditionExpression = parent.contains('test')

    const isActionExpression =
        callee.type === 'Identifier' && callee.name === 'Action'

    if (!isConditionExpression && !isActionExpression) {
        console.error('Invalid callExpression')
        return null
    }

    if (isConditionExpression) {
        const root = List(['definitions'])
        const firstArg = funcArgs[0]
        const secondArg = funcArgs[1]

        let left = root.concat(getSyntaxTreeLeaves(funcArgs[0])) as List<any>

        // we find the first object after the definitions, Ex: ticket => Ticket
        // this is needed to match the swagger spec structure
        let definition = left.get(1) as string
        // We shave some hardcoded definitions
        //eslint-disable-next-line no-prototype-builtins
        if (OBJECT_DEFINITIONS.hasOwnProperty(definition)) {
            definition =
                OBJECT_DEFINITIONS[
                    definition as keyof typeof OBJECT_DEFINITIONS
                ]
        } else {
            // if we can't find it just try to uppercase the first letter
            definition = _upperFirst(definition)
        }
        left = left.set(1, definition)
        // each object in the swagger spec has properties
        if (left.get(2) !== 'properties') {
            left = left.splice(2, 0, 'properties') as List<any>
        }

        return (
            <span
                className="flex flex-wrap"
                ref={setRef}
                style={{
                    width: '100%',
                    paddingRight: '32px',
                    alignItems: 'center',
                    minHeight: 32,
                }}
            >
                <Expression
                    {...firstArg}
                    parent={parent.push('arguments', 0)}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={root}
                    className="IdentifierDropdown"
                />
                <Expression
                    {...(callee as unknown as ComponentProps<
                        typeof Expression
                    >)}
                    parent={parentCallee}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={left.push('meta', 'operators')}
                    className="OperatorDropdown"
                />
                {secondArg ? (
                    <Expression
                        {...secondArg}
                        parent={parent.push('arguments', 1)}
                        callee={callee}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={left}
                    />
                ) : null}
                {
                    // ensures that the top level "if" statement cannot be deleted
                    hovered && parent.last() !== 'test' && (
                        <DeleteBinaryExpression
                            parent={parent}
                            rule={rule}
                            actions={actions}
                        />
                    )
                }
            </span>
        )
    }

    // This case for handling actions.
    // Action("hello_action", {subject: "hello", body: "hello world"})
    const actionName = funcArgs[0] as { value: string }
    const actionArguments = funcArgs[1] as { properties: any[] }
    const actionRootLeftSiblings = List(['actions'])

    return (
        <span ref={setRef}>
            <Action
                value={actionName.value}
                parent={parent.push('arguments', 0)}
                rule={rule}
                actions={actions}
                schemas={schemas}
                depth={depth}
                properties={actionArguments.properties}
            >
                {isValidActionKey(actionName.value) ? (
                    <ObjectExpression
                        properties={actionArguments.properties}
                        actions={actions}
                        leftsiblings={actionRootLeftSiblings.push(
                            actionName.value,
                        )}
                        rule={rule}
                        schemas={schemas}
                        parent={parent.push('arguments', 1)}
                        className="ActionWidget"
                        config={actionsConfig[actionName.value]}
                    />
                ) : null}
            </Action>
        </span>
    )
}
