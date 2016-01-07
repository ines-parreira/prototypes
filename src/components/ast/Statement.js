import React, {PropTypes} from 'react'
import Expression from './Expression'
import UnknownSyntax from './UnknownSyntax.js'
import { AddAction, AddIf, DeleteBlockStatementItem, AddLogicalAndCondition } from './OperationButtons'

export default class Statement extends React.Component {
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

Statement.propTypes = {
    type: PropTypes.string
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

        const statements = body.map((bodyItem, idx) => {
            const parentNew = parent.push('body', idx)

            return (
                <div className="BlockStatementItem" key={ idx }>
                    <div className="item">
                        <DeleteBlockStatementItem parent={ parentNew } index={ index }
                                                  actions={ actions }/>
                        <Statement { ...bodyItem } parent={ parentNew } index={ index }
                                                   actions={ actions }/>
                    </div>
                    <AddAction parent={ parentNew } index={ index } actions={ actions }/>
                    <AddIf parent={ parentNew } index={ index } actions={ actions }/>
                </div>
            )
        })

        const parentNew = parent.push('body', -1)
        statements.unshift(
            (
                <div className="BlockStatementItem" key={ -1 }>
                    <AddAction parent={ parentNew }
                               index={ index }
                               actions={ actions }/>
                    <AddIf parent={ parentNew }
                           index={ index }
                           actions={ actions }/>
                </div>
            )
        )

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
        const { type, test, consequent, index, actions, parent, schemas } = this.props
        let alternate = this.props.alternate

        if (alternate === null) {
            alternate = {
                type: "BlockStatement",
                body: [],
            }
        }

        const parentTest = parent.push('test')
        const parentConsequent = parent.push('consequent')
        const parentAlternate = parent.push('alternate')

        return (
            <div className="IfStatement">
                <div className="test">
                    <button className="ui button inline positive">IF</button>
                    <Expression
                        { ...test }
                        parent={ parentTest }
                        index={ index }
                        actions={ actions }
                        schemas={ schemas }
                    />
                    <AddLogicalAndCondition parent={ parentTest } index={ index } actions={ actions } />
                </div>
                <div className="consequent">
                    <button className="ui button inline positive">THEN</button>
                    <Statement { ...consequent } parent={ parentConsequent } index={ index } actions={ actions }/>
                </div>
                <div className="alternate">
                    <button className="ui button positive else">ELSE</button>
                    <div className="alternate-tab">
                        <Statement { ...alternate } parent={ parentAlternate } index={ index } actions={ actions }/>
                    </div>
                </div>
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


