import React, {ComponentProps} from 'react'
import {List, Map} from 'immutable'

import {RuleItemActions} from '../../../settings/rules/types'

import {Statement} from './statements/index.js'
import AddActionOrIfStatement from './operations/AddActionOrIfStatement'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    body: Array<ComponentProps<typeof Statement>>
}

export default class Program extends React.Component<Props> {
    render() {
        const {actions, body, rule} = this.props

        return (
            <div className="Program-wrapper">
                <div className="consequent">
                    <AddActionOrIfStatement
                        actions={actions}
                        rule={rule}
                        parent={List([])}
                        title="THEN"
                        depth={0}
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
        )
    }
}
