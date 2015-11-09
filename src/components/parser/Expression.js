import React from 'react'
import UnknownSyntax from './Utils'
import DropdownButton from '../semanticui/Dropdown'

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
                <Expression { ..._argument } key={idx}/>
            )
        })

        return (
            <span className="CallExpression">
                <span class="callee">
                    <Expression { ...callee } />
                </span>
                <span class="arguments">
                    { arguments_expressions }
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
    render() {
        const { type, object, property, computed } = this.props

        return (
            <span className="MemberExpression">
                <div className="ui buttons">
                    <div className="ui button">
                        <Expression {...object} />.<Expression {...property} />
                    </div>
                    <div className="ui floating dropdown icon button">
                        <i className="dropdown icon"></i>

                        <div className="menu">
                            <div className="item"><i class="edit icon"></i> Edit Post</div>
                            <div className="item"><i class="delete icon"></i> Remove Post</div>
                            <div className="item"><i class="hide icon"></i> Hide Post</div>
                        </div>
                    </div>
                </div>
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
        const { type, operator, left, right } = this.props

        return (
            <span className="BinaryExpression">
                <span className="left">
                    <Expression {...left} />
                </span>
                <span className="operator">
                    <DropdownButton text={ operator }/>
                </span>
                <span className="right">
                    <Expression {...right} />
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
        const { type, operator, left, right } = this.props

        return (
            <span className="LogicalExpression">
                <span className="left">
                    <Expression {...left} />
                </span>
                <span className="operator">
                    <DropdownButton text={ operator }/>
                </span>
                <span className="right">
                    <Expression {...right} />
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
        const { type, name } = this.props

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
                        { name }
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
        const { type, value } = this.props

        return (

            <span className="Literal">
                <DropdownButton text={ value }/>
            </span>
        )
    }
}

export default Expression