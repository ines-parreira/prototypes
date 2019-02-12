// @flow
import React from 'react'
import PropTypes from 'prop-types'
import {List} from 'immutable'
import {upperFirst} from 'lodash'

import Action, {actionsConfig} from '../actions/Action'
import Hoverable from '../../Hoverable'
import {DeleteBinaryExpression} from '../operations'

import {getSyntaxTreeLeaves} from '../utils'
import {OBJECT_DEFINITIONS} from '../../../../../state/rules/constants'

import ObjectExpression from './ObjectExpression'
import Expression from './Expression'

/*
 Standard interface CallExpression <: Expression {
 type: "CallExpression";
 callee: Expression;
 arguments: [ Expression ];
 }

 In our customized CallExpression
 */

type Props = {
    rule: Object,
    actions: Object,
    arguments: Array<*>,
    callee: Object,
    parent: List<*>,
    schemas: Object,
    depth: number
}

export class WrappedCallExpression extends React.Component<Props> {
    render() {
        const {actions, callee, rule, parent, schemas, depth} = this.props
        const {hovered} = this.context

        const funcArgs = this.props.arguments
        const parentCallee = parent.push('callee')

        const isConditionExpression = parent.contains('test')
        const isActionExpression = callee.type === 'Identifier' && callee.name === 'Action'

        if (!isConditionExpression && !isActionExpression) {
            console.error('Invalid callExpression')
            return null
        }

        // We assume in IfStatement.test, all the function calls look like
        // CallExpression <: Expression
        // callee: Identifier
        // arguments: Expression1, Expression2
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
                )
            }

            const root = List(['definitions'])
            const firstArg = funcArgs[0]
            const secondArg = funcArgs[1]

            let left = root.concat(getSyntaxTreeLeaves(funcArgs[0]))

            // we find the first object after the definitions, Ex: ticket => Ticket
            // this is needed to match the swagger spec structure
            let definition = left.get(1)
            // We shave some hardcoded definitions
            if (OBJECT_DEFINITIONS.hasOwnProperty(definition)) {
                definition = OBJECT_DEFINITIONS[definition]
            } else {
                // if we can't find it just try to uppercase the first letter
                definition = upperFirst(definition)
            }
            left = left.set(1, definition)
            // each object in the swagger spec has properties
            if (left.get(2) !== 'properties') {
                left = left.splice(2, 0, 'properties')
            }

            return (
                <span>
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
                    {secondArg ?
                        <Expression
                            {...secondArg}
                            parent={parent.push('arguments', 1)}
                            callee={callee}
                            rule={rule}
                            actions={actions}
                            schemas={schemas}
                            leftsiblings={left}
                        />
                        : null
                    }
                    {hovered && deleteBinaryExpression}
                </span>
            )
        }

        // This case for handling actions.
        // Action("hello_action", {subject: "hello", body: "hello world"})
        const actionName = funcArgs[0]
        const actionArguments = funcArgs[1]
        const actionRootLeftSiblings = List(['actions'])

        return (
            <div>
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
            </div>
        )
    }
}

WrappedCallExpression.contextTypes = {
    hovered: PropTypes.bool,
}

export default Hoverable(WrappedCallExpression)
