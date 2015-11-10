import React from 'react'
import Expression from './Expression'
import UnknownSyntax from './Utils'
import DropDownButton from '../semanticui/Dropdown'

class Statement extends React.Component {

    render() {
        const {type} = this.props

        switch (type) {
            case 'IfStatement':
                return (
                    <IfStatement {...this.props} />
                )

            case 'ExpressionStatement':
                return (
                    <ExpressionStatement {...this.props} />
                )

            case 'BlockStatement':
                return (
                    <BlockStatement { ...this.props } />
                )

            case undefined:
                return (
                    <span></span>
                )

            default:
                return <UnknownSyntax { ...this.props } />
        }
    }
}

/*
 interface BlockStatement <: Statement {
 type: "BlockStatement";
 body: [ Statement ];
 }
 */
class BlockStatement extends React.Component {
    render() {
        const { type, body, index, actions } = this.props
        var parent = this.props.parent
        var statements = body.map(function (_body, idx) {
            var _parent = parent.push('body', idx)

            return (
                <div className="BlockStatementItem">
                    <Statement key={ idx } { ..._body } parent={_parent} index={index} actions={actions} />
                </div>
            )
        })

        return (
            <div className="BlockStatement">
                { statements }
            </div>
        )
    }
}

/*
 interface IfStatement <: Statement {
 type: "IfStatement";
 test: Expression;
 consequent: Statement;
 alternate: Statement | null;
 }
 */
class IfStatement extends React.Component {
    render() {
        const { type, test, consequent, alternate, index, actions } = this.props
        var _alternate

        if (alternate) {
            var _parent_alternate = this.props.parent.push('alternate')

            _alternate = (
                <div class="alternate">
                    <button className="ui button positive else">ELSE</button>
                    <div className="alternate-tab">
                        <Statement { ...alternate } parent={_parent_alternate} index={index} actions={actions} />
                    </div>
                </div>
            )
        }

        var _parent_test = this.props.parent.push('test')
        var _parent_consequent = this.props.parent.push('consequent')

        return (
            <div className="IfStatement">
                <div className="test">
                    <button className="ui button inline positive">IF</button>
                    <Expression { ...test} parent = {_parent_test} index={index} actions={actions} />
                </div>
                <div className="consequent">
                    <Statement { ...consequent} parent = {_parent_consequent} index={index} actions={actions} />
                </div>
                { _alternate }
            </div>
        )
    }
}

/*
 interface ExpressionStatement <: Statement {
 type: "ExpressionStatement";
 expression: Expression;
 }
 */
class ExpressionStatement extends React.Component {
    render() {
        const { type, expression, index, actions } = this.props
        var _parent = this.props.parent.push('expression')

        return (
            <div className="ExpressionStatement">
                <Expression {...expression} parent = {_parent} index={index} actions={actions} />
            </div>
        )
    }
}


export default Statement