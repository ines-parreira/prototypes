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
        const {expression, rule, actions, parent, schemas} = this.props
        const parentNew = parent.push('expression')

        return (
            <div className="ExpressionStatement">
                <Expression
                    {...expression}
                    parent={parentNew}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                />
            </div>
        )
    }
}

ExpressionStatement.propTypes = {
    rule: PropTypes.object.isRequired,
    expression: PropTypes.object,
    parent: PropTypes.object,
    actions: PropTypes.object,
    schemas: PropTypes.object
}
