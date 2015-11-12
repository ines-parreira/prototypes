import React from 'react'
import Expression from './Expression'
import UnknownSyntax from './Utils'
import { AddAction, DeleteBlockStatementItem } from './OperationButtons.js'

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
        const { type, body, index, actions, parent } = this.props

        const length = body.length
        const statements = body.map(function(bodyItem, idx) {
            const parentNew = parent.push('body', idx)

            return (
                <div className="BlockStatementItem">
                    <div className="item">
                        <Statement key={ idx } { ...bodyItem } parent={ parentNew } index={ index }
                                   actions={ actions }/>
                    </div>
                    <AddAction key={ 2*length + idx } parent={ parentNew } index={ index } actions={ actions }/>
                    <DeleteBlockStatementItem key={ 3*length + idx } parent={ parentNew } index={ index }
                                              actions={ actions }/>
                </div>
            )
        })

        const parentNew = parent.push('body', -1)
        statements.unshift(<div className="BlockStatementItem"><AddAction key={ -1 } parent={ parentNew }
                                                                          index={ index }
                                                                          actions={ actions }/></div>)

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
        const { type, test, consequent, alternate, index, actions, parent } = this.props
        let alternateDiv

        if (alternate) {
            const parentAlternate = parent.push('alternate')

            alternateDiv = (
                <div className="alternate">
                    <button className="ui button positive else">ELSE</button>
                    <div className="alternate-tab">
                        <Statement { ...alternate } parent={ parentAlternate } index={ index } actions={ actions }/>
                    </div>
                </div>
            )
        }

        const parentTest = parent.push('test')
        const parentConsequent = parent.push('consequent')

        return (
            <div className="IfStatement">
                <div className="test">
                    <button className="ui button inline positive">IF</button>
                    <Expression { ...test } parent={ parentTest } index={ index } actions={ actions }/>
                </div>
                <div className="consequent">
                    <Statement { ...consequent } parent={ parentConsequent } index={ index } actions={ actions }/>
                </div>
                { alternateDiv }
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
        const { type, expression, index, actions, parent } = this.props
        const parentNew = parent.push('expression')

        return (
            <div className="ExpressionStatement">
                <Expression { ...expression } parent={ parentNew } index={ index } actions={ actions }/>
            </div>
        )
    }
}


export default Statement