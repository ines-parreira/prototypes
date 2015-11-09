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
        const { type, body } = this.props
        var statements = body.map(function (_body, idx) {
            return (
                <div className="BlockStatementItem">
                    <Statement { ..._body } key={ idx }/>
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
        const { type, test, consequent, alternate } = this.props
        var _alternate

        if (alternate) {
            _alternate = (
                <div class="alternate">
                    <button className="ui button positive else">ELSE</button>
                    <div className="alternate-tab">
                        <Statement { ...alternate } />
                    </div>
                </div>
            )
        }

        return (
            <div className="IfStatement">
                <div className="test">
                    <button className="ui button inline positive">IF</button>
                    <Expression { ...test} />
                </div>
                <div className="consequent">
                    <Statement { ...consequent} />
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
        const { type, expression } = this.props

        return (
            <div className="ExpressionStatement">
                <Expression {...expression} />
            </div>
        )
    }
}


export default Statement