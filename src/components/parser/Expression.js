import React from 'react'
import UnknownSyntax from './Utils'
import DropdownButton from '../rule/Dropdown'

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
 interface CallExpression <: Expression {
 type: "CallExpression";
 callee: Expression;
 arguments: [ Expression ];
 }
 */
class CallExpression extends React.Component {
    render() {
        const { type, callee, index, actions, parent } = this.props
        const functionArguments = this.props.arguments

        const argumentsExpressions = functionArguments.map(function(argumentItem, idx) {
            const parentArguments = parent.push('arguments', idx)

            return (
                <Expression { ...argumentItem } key={idx} parent={parentArguments} index={index} actions={actions}/>
            )
        })

        const parentCallee = parent.push('callee')

        return (
            <span className="CallExpression">
                <span className="callee">
                    <Expression { ...callee } parent={parentCallee} index={index} actions={actions}/>
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
        const { type, object, property, computed, index, actions, parent } = this.props
        const parentObject = parent.push('object')
        const parentProperty = parent.push('property')

        return (
            <span className="MemberExpression">
                <Expression { ...object } parent={parentObject} index={index} actions={actions} /><b>.</b>
                <Expression { ...property } parent={parentProperty} index={index} actions={actions} />
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
        const { type, operator, left, right, index, actions, parent } = this.props
        const parentLeft = parent.push('left')
        const parentRight = parent.push('right')
        const parentOperator = parent.push('operator')

        return (
            <span className="BinaryExpression">
                <span className="left">
                    <Expression {...left} parent={parentLeft} index={index} actions={actions}/>
                </span>
                <span className="operator">
                    <DropdownButton text={ operator } parent={parentOperator} index={index} actions={actions}/>
                </span>
                <span className="right">
                    <Expression {...right} parent={parentRight} index={index} actions={actions}/>
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
class LogicalExpression extends BinaryExpression {
    render() {
        const { type, operator, left, right, index, parent, actions } = this.props
        const parentLeft = parent.push('left')
        const parentRight = parent.push('right')
        const parentOperator = parent.push('operator')

        return (
            <span className="LogicalExpression">
                <span className="left">
                    <Expression { ...left } parent={ parentLeft } index={ index } actions={ actions }/>
                </span>
                <span className="operator">
                    <DropdownButton text={ operator } parent={ parentOperator } index={ index } actions={ actions }/>
                </span>
                <span className="right">
                    <Expression { ...right } parent={ parentRight } index={ index } actions={ actions }/>
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
        const { type, name, parent, index, actions } = this.props
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
                         <DropdownButton text={ name } parent={ parentNew } index={ index } actions={ actions }/>
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
        const { type, value, index, actions, parent } = this.props

        const parentNew = parent.push('value')

        return (

            <span className="Literal">
                <DropdownButton text={ value } parent={ parentNew } index={ index } actions={ actions }/>
            </span>
        )
    }
}

export default Expression