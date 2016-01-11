import React, {PropTypes} from 'react'
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
export default class LogicalExpression extends React.Component {
    render() {
        const { operator, left, right, index, parent, actions, leftsiblings, schemas } = this.props
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
            <span className="LogicalExpression">
                <span className="left">
                    <Expression
                        {...left}
                        parent={parentLeft}
                        index={index}
                        actions={actions}
                        schemas={schemas}
                        leftsiblings={leftsiblings}
                    />
                </span>
                <span className="operator">
                    {/* <Widget value={ operator } parent={ parentOperator } index={ index } actions={ actions }
                     leftsiblings={leftsiblings2}/>*/}
                    <button className="AndOperator ui button dropdown">AND</button>
                </span>
                <span className="right">
                    <Expression
                        { ...right }
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
}


LogicalExpression.propTypes = {
    operator: PropTypes.string,
    left: PropTypes.object,
    right: PropTypes.object,
    actions: PropTypes.object
}
