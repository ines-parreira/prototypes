// @flow
import React from 'react'
import {Button} from 'reactstrap'

import Expression from '../expression/Expression'

import {getSyntaxTreeLeaves} from '../utils'

/*
 interface LogicalExpression <: Expression {
 type: "LogicalExpression";
 operator: LogicalOperator;
 left: Expression;
 right: Expression;
 }
 */

type Props = {
    rule: Object,
    actions: Object,
    left: Object,
    leftsiblings?: Object,
    operator: string,
    parent: Object,
    right: Object,
    schemas: Object
}

export default class LogicalExpression extends React.Component<Props> {
    render() {
        const {operator, left, right, rule, parent, actions, leftsiblings, schemas} = this.props

        let leftsiblings2
        let leftsiblings3

        if (leftsiblings) {
            leftsiblings2 = leftsiblings.concat(getSyntaxTreeLeaves(left))
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
                        className="IdentifierDropdown"
                    />
                </span>
                <div className="d-flex align-items-baseline mt-1 ml-3">
                    <Button
                        className="LogicalOperator btn-frozen mr-1"
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
                            className="IdentifierDropdown"
                        />
                    </span>
                </div>
            </span>
        )
    }
}
