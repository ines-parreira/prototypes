import React from 'react'

import Expression from '../expression/Expression'

import getSyntaxTreeLeaves from '../utils'

/*
 interface LogicalExpression <: Expression {
 type: "LogicalExpression";
 operator: LogicalOperator;
 left: Expression;
 right: Expression;
}
 */
const LogicalExpression = ({ operator, left, right, index, parent, actions, leftsiblings, schemas }) => {
    let leftsiblings2
    let leftsiblings3

    if (leftsiblings) {
        leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(left))
        leftsiblings3 = leftsiblings2.push('operator')
    }

    return (
        <span className="LogicalExpression">
            <span className="left">
                <Expression
                    {...left}
                    parent={parent.push('left')}
                    index={index}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings}
                />
            </span>
            <div>
                <span className="operator">
                    <button className="ui button">{operator === '&&' ? 'AND' : 'OR'}</button>
                </span>
                <span className="right">
                    <Expression
                        {...right}
                        parent={parent.push('right')}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={leftsiblings3}
                    />
                </span>
            </div>
        </span>
    )
}


LogicalExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    left: React.PropTypes.object.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    operator: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    right: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default LogicalExpression
