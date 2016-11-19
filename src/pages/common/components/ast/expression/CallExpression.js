import React, {PropTypes} from 'react'
import Immutable from 'immutable'
import {upperFirst} from 'lodash'

import Action from '../actions/Action'
import Expression from './Expression'
import Hoverable from '../../Hoverable'
import ObjectExpression from './ObjectExpression'
import {DeleteBinaryExpression} from '../operations'

import getSyntaxTreeLeaves from '../utils'
import {OBJECT_DEFINITIONS} from '../../../../../state/rules/constants'

/*
 Standard interface CallExpression <: Expression {
 type: "CallExpression";
 callee: Expression;
 arguments: [ Expression ];
 }

 In our customized CallExpression
 */
class CallExpression extends React.Component {
    render() {
        const {actions, callee, rule, parent, schemas} = this.props
        const {hovered} = this.context

        const funcArgs = this.props.arguments
        const parentCallee = parent.push('callee')

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

        // We assume in IfStatement.test, all the function calls look like
        // CallExpression <: Expression
        // callee: Identifier
        // arguments: Expression1, Expression2
        if (parent.contains('test')) {
            const root = Immutable.List(['definitions'])
            let left = root.push(...getSyntaxTreeLeaves(funcArgs[0]))

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
                        {...funcArgs[0]}
                        parent={parent.push('arguments', 0)}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={root}
                    />
                    <Expression
                        {...callee}
                        parent={parentCallee}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={left.push('meta', 'operators')}
                    />
                    <Expression
                        {...funcArgs[1]}
                        parent={parent.push('arguments', 1)}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={left}
                    />
                    {hovered && deleteBinaryExpression}
                </span>
            )
        }

        // This case for handling actions.
        // Action("hello_action", {subject: "hello", body: "hello world"})
        if (callee.type === 'Identifier' && callee.name === 'Action') {
            const actionName = funcArgs[0]
            const actionArguments = funcArgs[1]
            const actionRootLeftSiblings = Immutable.List(['actions'])
            return (
                <div>
                    <Action
                        value={actionName.value}
                        parent={parent.push('arguments', 0)}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={actionRootLeftSiblings}
                    >
                        <ObjectExpression
                            {...actionArguments}
                            actions={actions}
                            leftsiblings={actionRootLeftSiblings.push(actionName.value)}
                            rule={rule}
                            schemas={schemas}
                            parent={parent.push('arguments', 1)}
                        />
                    </Action>
                </div>
            )
        }

        // Else, it's a normal function. We handle it in normal way.
        const argumentsExpressions = funcArgs.map((argumentItem, idx) => {
            const parentArguments = parent.push('arguments', idx)

            return (
                <Expression
                    {...argumentItem}
                    key={idx}
                    parent={parentArguments}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                />
            )
        })

        // The case for Actions.
        return (
            <span>
                <span className="callee">
                    <Expression
                        {...callee}
                        parent={parentCallee}
                        rule={rule}
                        actions={actions}
                        schemas={schemas}
                    />
                </span>
                <span className="arguments">
                    {argumentsExpressions}
                </span>
            </span>
        )
    }
}

CallExpression.propTypes = {
    rule: PropTypes.object.isRequired,
    actions: PropTypes.object,
    arguments: PropTypes.array.isRequired,
    callee: PropTypes.object.isRequired,
    parent: PropTypes.object,
    type: PropTypes.string,
    schemas: PropTypes.object.isRequired,
}

CallExpression.contextTypes = {
    hovered: PropTypes.bool,
}

export default Hoverable(CallExpression)
