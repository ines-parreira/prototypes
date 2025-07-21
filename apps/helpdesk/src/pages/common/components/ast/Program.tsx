import React, { ComponentProps } from 'react'

import { List, Map } from 'immutable'

import { RuleContext } from 'pages/common/hooks/rule/RuleProvider'
import { RuleItemActions } from 'pages/settings/rules/types'

import Expression from './expression/Expression'
import AddActionOrIfStatement from './operations/AddActionOrIfStatement'
import Statement from './statements/Statement'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    body: Array<ComponentProps<typeof Statement>>
}

export default function Program({ actions, body, rule }: Props) {
    return (
        <RuleContext.Provider value={{ Expression, Statement }}>
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
                                    <div
                                        key={key}
                                        className="BlockStatementItem"
                                    >
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
        </RuleContext.Provider>
    )
}
