import React, {PropTypes} from 'react'
import Immutable from 'immutable'

import Expression from './Expression'
import ObjectExpression from './ObjectExpression'
import MatchingObjectsCounter from './MatchingObjectsCounter'
import {DeleteBinaryExpression} from './OperationButtons'
import DropdownButton from './Dropdown'

import getSyntaxTreeLeaves from './utils'

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
        const { callee, index, actions, schemas, parent} = this.props
        const functionArguments = this.props.arguments

        const parentCallee = parent.push('callee')


        let deleteBinaryExpression = ''
        let objectsCounter = ''
        // ensures that the top level "if" statement cannot be deleted
        if (parent.last() !== 'test') {
            deleteBinaryExpression = (
                <DeleteBinaryExpression parent={parent} index={index} actions={actions}/>
            )
            objectsCounter = (
                <MatchingObjectsCounter />
            )
        }

        // We assume in Ifstatement.test, all the function calls look like
        // CallExpression <: Expression
        // callee: Identifier
        // arguments: Expression1, Expression2
        if (parent.contains('test')) {
            const rootsiblings = Immutable.List(['_'])
            const leftsiblings = rootsiblings.push(...getSyntaxTreeLeaves(functionArguments[0]))

            if (functionArguments.length !== 2) {
                console.log('Something wrong happened')
            }

            const parentArguments0 = parent.push('arguments', 0)
            const parentArguments1 = parent.push('arguments', 1)

            return (
                <span className="CallExpression">
                    <Expression { ...functionArguments[0] } parent={ parentArguments0 } index={ index }
                                                            actions={actions} leftsiblings={ rootsiblings }/>
                    <Expression { ...callee } parent={ parentCallee } index={ index } actions={ actions }
                                              leftsiblings={ leftsiblings }/>
                    <Expression { ...functionArguments[1] } parent={ parentArguments1 } index={ index }
                                                            actions={ actions }
                                                            leftsiblings={ leftsiblings.push('operator') }/>
                    { objectsCounter }
                    { deleteBinaryExpression }
                    <br/>
                </span>
            )
        }

        // This case for handling Action.
        // Action("hello_action", {subject: "hello", body: "hello world"})
        if (callee.type === 'Identifier' && callee.name === 'Action') {
            const actionName = functionArguments[0]
            const actionArguments = functionArguments[1]
            const actionRootLeftSiblings = Immutable.List(['actions'])
            return (
                <div>
                    <DropdownButton
                        text={ actionName.value }
                        parent={ parent.push('arguments', 1, 'value') }
                        index={ index }
                        actions={ actions }
                        leftsiblings={ actionRootLeftSiblings }
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
        const argumentsExpressions = functionArguments.map((argumentItem, idx) => {
            const parentArguments = parent.push('arguments', idx)

            return (
                <Expression { ...argumentItem } key={idx} parent={parentArguments} index={index} actions={actions}/>
            )
        })

        // The case for Actions.
        return (
            <span className="CallExpression">
                <span className="callee">
                    <Expression { ...callee } parent={ parentCallee } index={ index } actions={ actions }/>
                </span>
                <span className="arguments">
                    { argumentsExpressions }
                </span>
            </span>
        )
    }
}

CallExpression.propTypes = {
    type: PropTypes.string
}
