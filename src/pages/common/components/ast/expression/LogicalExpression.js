import React, {PropTypes} from 'react'
import {Button} from 'reactstrap'

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
const LogicalExpression = ({operator, left, right, rule, parent, actions, leftsiblings, schemas}) => {
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
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    leftsiblings={leftsiblings}
                />
            </span>
            <div>
                <Button
                    className="btn-frozen"
                    type="button"
                    color="warning"
                >
                    {operator === '&&' ? 'AND' : 'OR'}
                </Button>
                <span className="right">
                    <Expression
                        {...right}
                        parent={parent.push('right')}
                        rule={rule}
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
    rule: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    left: PropTypes.object.isRequired,
    leftsiblings: PropTypes.object,
    operator: PropTypes.string.isRequired,
    parent: PropTypes.object.isRequired,
    right: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
}

export default LogicalExpression
