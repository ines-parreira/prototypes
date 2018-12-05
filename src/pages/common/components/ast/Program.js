// @flow
import React from 'react'
import {List} from 'immutable'

import {Statement} from './statements'
import {AddActionOrIfStatement} from './operations'


type ProgramType = {
    rule: Object,
    actions: Object,
    body: Array<*>
}

export default class Program extends React.Component<ProgramType> {
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
                    {
                        !!body && body.length > 0 && (
                            <div className="Program">
                                <div className="BlockStatement">
                                    {
                                        body.map((statement, key) => (
                                            <div key={key} className="BlockStatementItem">
                                                <Statement
                                                    {...statement}
                                                    parent={List(['body', key])}
                                                    rule={rule}
                                                    actions={actions}
                                                    depth={1}
                                                />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}
