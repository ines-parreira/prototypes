import React, {PropTypes} from 'react'
import Expression from '../expression/Expression'

/*
 interface ExpressionStatement <: Statement {
 type: "ExpressionStatement";
 expression: Expression;
 }
 */
export default class ExpressionStatement extends React.Component {
    render() {
        const { expression, index, actions, parent } = this.props
        const parentNew = parent.push('expression')

        return (
            <div className="ExpressionStatement">
                <Expression
                    {...expression}
                    parent={parentNew}
                    index={index}
                    actions={actions}
                />
            </div>
        )
    }
}

ExpressionStatement.propTypes = {
    expression: PropTypes.object,
    index: PropTypes.number,
    parent: PropTypes.object,
    actions: PropTypes.object
}
