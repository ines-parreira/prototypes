import React from 'react'
import UnknownSyntax from './Utils'
import DropdownButton from './Dropdown'
import { DeleteBinaryExpression } from './OperationButtons'
import Immutable from 'immutable'


/* Get all the name of the leaf nodes (Identifier and Literal nodes) of
 * the syntax tree.
 */
function getSyntaxTreeLeaves(syntaxTree) {
    if (syntaxTree === undefined || syntaxTree.type === undefined) {
        return null
    }

    if (syntaxTree.type === 'Identifier') {
        return Immutable.List([syntaxTree.name])
    }

    if (syntaxTree.type === 'Literal') {
        return Immutable.List([syntaxTree.value])
    }


    let ret = Immutable.List([])

    for (let key of Object.keys(syntaxTree)) {
        const r = getSyntaxTreeLeaves(syntaxTree[key])

        if (r !== null) {
            ret = ret.concat(r)
        }
    }

    return ret
}


class Expression extends React.Component {
    render() {
        const { type } = this.props

        switch (type) {
            case 'BinaryExpression':
                return (
                    <BinaryExpression { ...this.props } />
                )

            case 'LogicalExpression':
                return (
                    <LogicalExpression { ...this.props } />
                )

            case 'Literal':
                return (
                    <Literal { ...this.props } />
                )

            case 'Identifier':
                return (
                    <Identifier { ...this.props } />
                )

            case 'MemberExpression':
                return (
                    <MemberExpression { ...this.props } />
                )

            case 'CallExpression':
                return (
                    <CallExpression { ...this.props } />
                )

            default:
                return <UnknownSyntax { ... this.props } />
        }
    }
}


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
        const { type, callee, index, actions, parent } = this.props
        const functionArguments = this.props.arguments

        let argumentsExpressions = functionArguments.map(function(argumentItem, idx) {
            const parentArguments = parent.push('arguments', idx)

            return (
                <Expression { ...argumentItem } key={idx} parent={parentArguments} index={index} actions={actions}/>
            )
        })

        const parentCallee = parent.push('callee')


        let deleteBinaryExpressionComponent
        if (parent.last() !== 'test') {
            deleteBinaryExpressionComponent = (
                <DeleteBinaryExpression parent={parent} index={index} actions={actions}/>
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
                    { deleteBinaryExpressionComponent }
                </span>
            )
        }

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


/*
 interface MemberExpression <: Expression, Pattern {
 type: "MemberExpression";
 object: Expression;
 property: Expression;
 computed: boolean;
 }
 */
class MemberExpression extends React.Component {
    handleChange(event) {
        const {actions, index, parent } = this.props
        actions.modifyCodeast(index, parent, event.target.value)
    }

    render() {
        const { type, object, property, computed, index, actions, parent, leftsiblings } = this.props

        const parentObject = parent.push('object')
        const parentProperty = parent.push('property')

        let leftsiblings2
        if (leftsiblings) {
            leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(object))
        }

        return (
            <span className="MemberExpression">
                <Expression { ...object } parent={parentObject} index={index} actions={actions}
                                          leftsiblings={ leftsiblings }/>
                <Expression { ...property } parent={parentProperty} index={index} actions={actions}
                                            leftsiblings={ leftsiblings2 }/>
            </span>
        )
    }
}


/*
 interface BinaryExpression <: Expression {
 type: "BinaryExpression";
 operator: BinaryOperator;
 left: Expression;
 right: Expression;
 }
 */
class BinaryExpression extends React.Component {
    render() {
        const { type, operator, left, right, index, actions, parent, leftsiblings } = this.props
        const parentLeft = parent.push('left')
        const parentRight = parent.push('right')
        const parentOperator = parent.push('operator')


        let leftsiblings2
        let leftsiblings3

        if (leftsiblings) {
            leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(left))
            leftsiblings3 = leftsiblings2.push('operator')
        }

        return (
            <span className="BinaryExpression">
                <span className="left">
                    <Expression {...left} parent={parentLeft} index={index} actions={actions}
                                          leftsiblings={leftsiblings}/>
                </span>
                <span className="operator">
                    <DropdownButton text={ operator } parent={parentOperator} index={index} actions={actions}
                                    leftsiblings={leftsiblings2}/>
                </span>
                <span className="right">
                    <Expression {...right} parent={parentRight} index={index} actions={actions}
                                           leftsiblings={leftsiblings3}/>
                </span>
            </span>
        )
    }
}

/*
 interface LogicalExpression <: Expression {
 type: "LogicalExpression";
 operator: LogicalOperator;
 left: Expression;
 right: Expression;
 }
 */
class LogicalExpression extends React.Component {
    render() {
        const { type, operator, left, right, index, parent, actions, leftsiblings } = this.props
        const parentLeft = parent.push('left')
        const parentRight = parent.push('right')
        const parentOperator = parent.push('operator')

        let leftsiblings2
        let leftsiblings3

        if (leftsiblings) {
            leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(left))
            leftsiblings3 = leftsiblings2.push('operator')
        }

        return (
            <span className="LogicalExpression">
                <span className="left">
                    <Expression { ...left } parent={ parentLeft } index={ index } actions={ actions }
                                            leftsiblings={leftsiblings}/>
                </span>
                <span className="operator">
                    <DropdownButton text={ operator } parent={ parentOperator } index={ index } actions={ actions }
                                    leftsiblings={leftsiblings2}/>
                </span>
                <span className="right">
                    <Expression { ...right } parent={ parentRight } index={ index } actions={ actions }
                                             leftsiblings={leftsiblings3}/>
                </span>
            </span>
        )
    }
}


/*
 interface Identifier <: Node, Expression, Pattern {
 type: "Identifier";
 name: string;
 }
 */
class Identifier extends React.Component {
    render() {
        const { type, name, parent, index, actions, leftsiblings } = this.props
        const parentNew = parent.push('name')

        switch (name) {
            case 'Action':
                return (
                    <button className="ui orange button inline">TAKE ACTION</button>
                )
            case 'list_of_actions':
                return (
                    <span />
                )

            default:
                return (
                    <span className="Identifier">
                         <DropdownButton text={ name } parent={ parentNew } index={ index } actions={ actions }
                                         leftsiblings={ leftsiblings }/>
                    </span>
                )
        }
    }
}

/*
 interface Literal <: Node, Expression {
 type: "Literal";
 value: string | boolean | null | number | RegExp;
 }
 */
class Literal extends React.Component {
    render() {
        const { type, value, index, actions, parent, leftsiblings } = this.props

        const parentNew = parent.push('value')

        return (

            <span className="Literal">
                <DropdownButton text={ value } parent={ parentNew } index={ index } actions={ actions }
                                leftsiblings={ leftsiblings }/>
            </span>
        )
    }
}

export default Expression