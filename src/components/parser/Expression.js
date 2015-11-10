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
        const { type, callee, index, actions } = this.props
        var _arguments = this.props['arguments']

        var parent = this.props.parent
        var arguments_expressions = _arguments.map(function (_argument, idx) {
            var _parent_arguments = parent.push('arguments', idx)

            return (
                <Expression { ..._argument } key={idx} parent={_parent_arguments} index={index} actions={actions} />
            )
        })

        var _parent_callee = parent.push('callee')

        return (
            <span className="CallExpression">
                <span class="callee">
                    <Expression { ...callee } parent={_parent_callee} index={index} actions={actions} />
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
    handleChange(event) {
        console.log('onchange react.')
        console.log(this.props.parent)
        console.log(this.props.index)
    }

    render() {
        const { type, object, property, computed, index, actions } = this.props

        return (
            <span className="MemberExpression">
                <select className="ui dropdown" value="{object.name}.{property.name}" onChange={ this.handleChange.bind(this) }>
                    <option>
                        {/* <Expression {...object} />.<Expression {...property} /> */}
                        {object.name}.{property.name}
                    </option>
                    <option className="item"><i class="edit icon"></i> Edit Post</option>
                    <option className="item"><i class="delete icon"></i> Remove Post</option>
                    <option className="item"><i class="hide icon"></i> Hide Post</option>
                </select>
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
        const { type, operator, left, right, index, actions } = this.props
        var _parent_left = this.props.parent.push('left')
        var _parent_right = this.props.parent.push('right')
        var _parent_operator = this.props.parent.push('operator')

        return (
            <span className="BinaryExpression">
                <span className="left">
                    <Expression {...left} parent={_parent_left} index={index} actions={actions} />
                </span>
                <span className="operator">
                    <DropdownButton text={ operator } parent={_parent_operator} index={index} actions={actions} />
                </span>
                <span className="right">
                    <Expression {...right} parent={_parent_right} index={index} actions={actions} />
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
        const { type, operator, left, right, index, actions } = this.props
        var _parent_left = this.props.parent.push('left')
        var _parent_right = this.props.parent.push('right')
        var _parent_operator = this.props.parent.push('operator')

        return (
            <span className="LogicalExpression">
                <span className="left">
                    <Expression {...left} parent={_parent_left} index={index} actions={actions} />
                </span>
                <span className="operator">
                    <DropdownButton text={ operator } parent={_parent_operator} index={index} actions={actions} />
                </span>
                <span className="right">
                    <Expression {...right} parent={_parent_right} index={index} actions={actions} />
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
        const { type, value, index, actions } = this.props
        var _parent = this.props.parent.push('value')

        return (

            <span className="Literal">
                <DropdownButton text={ value } parent={_parent} index={index} actions={actions} />
            </span>
        )
    }
}

export default Expression