import React, { PropTypes } from 'react'
import Immutable from 'immutable'
import { upperFirst } from 'lodash'

import Expression from './Expression'
import ObjectExpression from './ObjectExpression'
import MatchingObjectsCounter from '../MatchingObjectsCounter'
import { DeleteBinaryExpression } from '../OperationButtons'
import Widget from '../Widget'

import getSyntaxTreeLeaves from '../utils'

/*
 Standard interface CallExpression <: Expression {
 type: "CallExpression";
 callee: Expression;
 arguments: [ Expression ];
 }

 In our customized CallExpression
 */
export default class CallExpression extends React.Component {
    render() {
        const { callee, index, actions, schemas, parent } = this.props
        const funcArgs = this.props.arguments
        const parentCallee = parent.push('callee')

        let deleteBinaryExpression = ''

        // ensures that the top level "if" statement cannot be deleted
        if (parent.last() !== 'test') {
            deleteBinaryExpression = (
                <DeleteBinaryExpression
                    parent={parent}
                    index={index}
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

            // we need to title the first object after the definition definitions, ticket => definitions, Ticket
            // this is needed to match the swagger spec structure
            left = left.set(1, upperFirst(left.get(1)))
            // each object in the swagger spec has properties
            if (left.get(2) !== 'properties') {
                left = left.splice(2, 0, 'properties')
            }

            return (
                <span className="CallExpression">
                    <Expression
                        {...funcArgs[0]}
                        parent={parent.push('arguments', 0)}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={root}
                    />
                    <Expression
                        {...callee}
                        parent={parentCallee}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={left.push('meta', 'operators')}
                    />
                    <Expression
                        {...funcArgs[1]}
                        parent={parent.push('arguments', 1)}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={left}
                    />

                    <MatchingObjectsCounter />

                    { deleteBinaryExpression }
                    <br />
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
                    <Widget
                        value={actionName.value}
                        parent={parent.push('arguments', 1, 'value')}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={actionRootLeftSiblings}
                    />
                    <ObjectExpression { ...actionArguments }
                        actions={ actions }
                        leftsiblings={ actionRootLeftSiblings.push(actionName.value) }
                        index={ index }
                        schemas={ schemas }
                        parent={ parent.push('arguments', 2) }
                    />
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
                    index={index}
                    actions={actions}
                    schemas={schemas}
                />
            )
        })

        // The case for Actions.
        return (
            <span className="CallExpression">
                <span className="callee">
                    <Expression
                        {...callee}
                        parent={parentCallee}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                    />
                </span>
                <span className="arguments">
                    { argumentsExpressions }
                </span>
            </span>
        )
    }
}

CallExpression.propTypes = {
    type: PropTypes.string,
    callee: PropTypes.object.isRequired,
    arguments: PropTypes.array.isRequired,
    index: PropTypes.number,
    parent: PropTypes.object,

    schemas: PropTypes.object.isRequired,
    actions: PropTypes.object
}
