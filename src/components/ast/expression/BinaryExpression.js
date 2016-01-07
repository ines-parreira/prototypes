import React, {PropTypes} from 'react'
import DropdownButton from '../Dropdown'
import Expression from './Expression'

import getSyntaxTreeLeaves from '../utils'

/*
 interface BinaryExpression <: Expression {
 type: "BinaryExpression";
 operator: BinaryOperator;
 left: Expression;
 right: Expression;
 }
 */
export default class BinaryExpression extends React.Component {
    render() {
        const { operator, left, right, index, actions, parent, leftsiblings } = this.props
        const parentLeft = parent.push('left')
        const parentRight = parent.push('right')
        const parentOperator = parent.push('operator')

        let leftsiblings2
        let leftsiblings3

        if (leftsiblings) {
            leftsiblings2 = leftsiblings.push(...getSyntaxTreeLeaves(left))
            leftsiblings3 = leftsiblings2.push('operator')
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
                    <DropdownButton
                        text={operator}
                        parent={parentOperator}
                        index={index}
                        actions={actions}
                        leftsiblings={leftsiblings2}
                    />
                </span>
                <span className="right">
                    <Expression {...right} parent={parentRight} index={index} actions={actions}
                                           leftsiblings={leftsiblings3}/>
                </span>
            </span>
        )
    }
}

BinaryExpression.propTypes = {
    type: PropTypes.string
}
