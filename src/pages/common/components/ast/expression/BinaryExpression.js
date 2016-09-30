import React from 'react'

import Expression from './Expression'
import Widget from '../Widget'

import getSyntaxTreeLeaves from '../utils'

/*
 interface BinaryExpression <: Expression {
 type: "BinaryExpression";
 operator: BinaryOperator;
 left: Expression;
 right: Expression;
}
 */
const BinaryExpression = ({ operator, left, right, index, actions, schemas, parent, leftsiblings }) => {
    const parentLeft = parent.push('left')
    const parentRight = parent.push('right')
    const parentOperator = parent.push('operator')

    let leftsiblings2
    let leftsiblings3

    if (leftsiblings) {
        leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(left))
        leftsiblings3 = leftsiblings2.push('operators')
    }

    return (
        <span className="BinaryExpression">
            <span className="left">
                <Expression
                    {...left}
                    parent={parentLeft}
                    index={index}
                    actions={actions}
                    leftsiblings={leftsiblings}
                />
            </span>
            <span className="operator">
                <Widget
                    value={operator}
                    parent={parentOperator}
                    index={index}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings2}
                />
            </span>
            <span className="right">
                <Expression
                    {...right}
                    parent={parentRight}
                    index={index}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings3}
                />
            </span>
        </span>
    )
}

BinaryExpression.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    left: React.PropTypes.object.isRequired,
    leftsiblings: React.PropTypes.object.isRequired,
    operator: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    right: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default BinaryExpression
