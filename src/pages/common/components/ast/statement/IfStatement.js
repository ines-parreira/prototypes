import React, {PropTypes} from 'react'
import Expression from '../expression/Expression'
import Statement from './Statement'
import {AddLine} from '../OperationButtons'

/*
 interface IfStatement <: Statement {
 type: "IfStatement";
 test: Expression;
 consequent: Statement;
 alternate: Statement | null;
}
 */
export default class IfStatement extends React.Component {
    render() {
        const {test, consequent, index, actions, parent, schemas} = this.props
        let alternate = this.props.alternate

        if (alternate === null) {
            alternate = {
                type: 'BlockStatement',
                body: []
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
                        {...test}
                        parent={parentTest}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                    />
                    <AddLine
                        parent={parentTest}
                        index={index}
                        actions={actions}
                    />
                </div>
                <div className="consequent">
                    <button className="ui button inline positive">THEN</button>
                    <Statement
                        {...consequent}
                        parent={parentConsequent}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                    />
                </div>
                <div className="alternate">
                    <button className="ui button positive else">ELSE</button>
                    <div className="alternate-tab">
                        <Statement
                            {...alternate}
                            parent={parentAlternate}
                            index={index}
                            actions={actions}
                            schemas={schemas}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
IfStatement.propTypes = {
    test: PropTypes.object,
    consequent: PropTypes.object,
    alternate: PropTypes.object,
    index: PropTypes.number,
    parent: PropTypes.object,
    schemas: PropTypes.object,
    actions: PropTypes.object
}
