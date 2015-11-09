import React from 'react'
import UnknownSyntax from './Utils'

class Expression extends React.Component {
    render() {
        const { type } = this.props
        switch (type) {
            case 'BinaryExpression':
                return (
                    <BinaryExpression {...this.props} />
                )

            case 'LogicalExpression':
                return (
                    <LogicalExpression {...this.props} />
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
        const { type, callee } = this.props
        var _arguments = this.props['arguments']

        var arguments_expressions = _arguments.map(function (_argument, idx) {
            return (
                <Expression { ..._argument } key={idx} />
            )
        })

        return (
            <div className="CallExpression">
                <Expression { ...callee } />
                ({ arguments_expressions })
            </div>
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
    render() {
        const { type, object, property, computed } = this.props

        return (
            <div className="{ MemberExpression }">
                <div className="object">
                    <Expression {...object} />
                </div>
                <div className="property">
                    .<Expression {...property} />
                </div>
            </div>
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
    constructor(props) {
        super(props)
        this.cssClassname = "BinaryExpression"
    }

    render() {
        const { type, operator, left, right } = this.props

        return (
            <div className="{ this.cssClassname }">
                <Expression {...left} />

                <div className="ui button">{ operator }</div>
                <Expression {...right} />
            </div>
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
    constructor(props) {
        super(props)
        this.cssClassname = "LogicalExpression"
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
        const { type, name } = this.props

        return (
            <div className="identifier">
                { name }
            </div>
        )
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
        const { type, value } = this.props

        return (
            <div className="literal">
                { value }
            </div>
        )
    }
}

export default Expression