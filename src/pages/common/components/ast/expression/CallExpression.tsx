import React from 'react'
import PropTypes from 'prop-types'
import {List, Map} from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import {
    RuleObjectType,
    ObjectExpressionPropertyKey,
} from '../../../../../state/rules/types'
import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import Action, {actionsConfig} from '../actions/Action'
import Hoverable from '../../Hoverable.js'
import DeleteBinaryExpression from '../operations/DeleteBinaryExpression.js'

import {getSyntaxTreeLeaves} from '../utils.js'

import ObjectExpression from './ObjectExpression'
import Expression from './Expression'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    arguments: any[]
    callee: ObjectExpressionPropertyKey
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}

export class WrappedCallExpression extends React.Component<Props> {
    static contextTypes = {
        hovered: PropTypes.bool,
    }

    render() {
        const {actions, callee, rule, parent, schemas, depth} = this.props
        const {hovered} = this.context

        const funcArgs = this.props.arguments
        const parentCallee = parent.push('callee')

        const isConditionExpression = parent.contains('test')
        const isActionExpression =
            callee.type === 'Identifier' && callee.name === 'Action'

        if (!isConditionExpression && !isActionExpression) {
            console.error('Invalid callExpression')
            return null
        }

        if (isConditionExpression) {
            let deleteBinaryExpression = ''

            // ensures that the top level "if" statement cannot be deleted
            if (parent.last() !== 'test') {
                deleteBinaryExpression = (
                    <DeleteBinaryExpression
                        parent={parent}
                        rule={rule}
                        actions={actions}
                    />
                ) as any
            }

            const root = List(['definitions'])
            const firstArg = funcArgs[0]
            const secondArg = funcArgs[1]

            let left = root.concat(getSyntaxTreeLeaves(funcArgs[0])) as List<
                any
            >

            // we find the first object after the definitions, Ex: ticket => Ticket
            // this is needed to match the swagger spec structure
            let definition: RuleObjectType | string = left.get(
                1
            ) as RuleObjectType
            // We shave some hardcoded definitions
            if (RuleObjectType[definition as RuleObjectType] != null) {
                definition = RuleObjectType[definition as RuleObjectType]
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
                <>
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
                        {...callee}
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
                    {hovered && deleteBinaryExpression}
                </>
            )
        }

        // This case for handling actions.
        // Action("hello_action", {subject: "hello", body: "hello world"})
        const actionName = funcArgs[0] as {value: string}
        const actionArguments = funcArgs[1] as {properties: any[]}
        const actionRootLeftSiblings = List(['actions'])

        return (
            <Action
                value={actionName.value}
                parent={parent.push('arguments', 0)}
                rule={rule}
                actions={actions}
                schemas={schemas}
                leftsiblings={actionRootLeftSiblings}
                depth={depth}
            >
                <ObjectExpression
                    properties={actionArguments.properties}
                    actions={actions}
                    leftsiblings={actionRootLeftSiblings.push(actionName.value)}
                    rule={rule}
                    schemas={schemas}
                    parent={parent.push('arguments', 1)}
                    className="ActionWidget"
                    config={actionsConfig[actionName.value]}
                />
            </Action>
        )
    }
}

export default Hoverable(WrappedCallExpression)
