import React from 'react'
import PropTypes from 'prop-types'

import Widget from '../Widget'

import {getSyntaxTreeLeaves} from '../utils'

import Expression from './Expression'

/*
 interface BinaryExpression <: Expression {
 type: "BinaryExpression";
 operator: BinaryOperator;
 left: Expression;
 right: Expression;
}
 */
const BinaryExpression = ({
    operator,
    left,
    right,
    rule,
    actions,
    schemas,
    parent,
    leftsiblings,
}) => {
    const parentLeft = parent.push('left')
    const parentRight = parent.push('right')
    const parentOperator = parent.push('operator')

    let leftsiblings2
    let leftsiblings3

    if (leftsiblings) {
        leftsiblings2 = leftsiblings.concat(getSyntaxTreeLeaves(left))
        leftsiblings3 = leftsiblings2.push('operators')
    }

    return (
        <span className="BinaryExpression">
            <span className="left">
                <Expression
                    {...left}
                    parent={parentLeft}
                    rule={rule}
                    actions={actions}
                    leftsiblings={leftsiblings}
                    className="IdentifierDropdown"
                />
            </span>
            <span className="operator">
                <Widget
                    value={operator}
                    parent={parentOperator}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings2}
                    className="OperatorDropdown"
                />
            </span>
            <span className="right">
                <Expression
                    {...right}
                    parent={parentRight}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings3}
                    className="IdentifierDropdown"
                />
            </span>
        </span>
    )
}

BinaryExpression.propTypes = {
    rule: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    left: PropTypes.object.isRequired,
    leftsiblings: PropTypes.object.isRequired,
    operator: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired,
    right: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
}

export default BinaryExpression
