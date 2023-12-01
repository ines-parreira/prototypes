import React, {ComponentProps} from 'react'
import {List, Map} from 'immutable'

import {RuleItemActions} from 'pages/settings/rules/types'

import Expression from './expression/Expression'
import {expressionReference} from './expression/expressionReference'
import Statement from './statements/Statement'
import {statementReference} from './statements/statementReference'
import AddActionOrIfStatement from './operations/AddActionOrIfStatement'

// we store a reference to `Expression` and `Statement` in
// order to avoid a circular reference down the line from
// child-expression/statements to the generic components
expressionReference.Expression = Expression
statementReference.Statement = Statement

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    body: Array<ComponentProps<typeof Statement>>
}

export default function Program({actions, body, rule}: Props) {
    return (
        <div className="Program-wrapper">
            <div className="consequent">
                <AddActionOrIfStatement
                    actions={actions}
                    rule={rule}
                    parent={List([])}
                    title="THEN"
                    depth={0}
                    empty={!body || body.length === 0}
                />
                {!!body && body.length > 0 && (
                    <div className="Program">
                        <div className="BlockStatement">
                            {body.map((statement, key) => (
                                <div key={key} className="BlockStatementItem">
                                    <Statement
                                        {...statement}
                                        parent={List(['body', key])}
                                        rule={rule}
                                        actions={actions}
                                        depth={1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
