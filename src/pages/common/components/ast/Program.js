import React from 'react'
import {List} from 'immutable'

import {Statement} from './statements'
import {AddActionOrIfStatement} from './operations'

class Program extends React.Component {
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
                    />
                </div>
                {
                    !!body && body.length > 0 && (
                        <div className="Program">
                            {
                                body.map((statement, key) => (
                                    <Statement
                                        {...statement}
                                        key={key}
                                        parent={List(['body', key])}
                                        rule={rule}
                                        actions={actions}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>
        )
    }
}

Program.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    body: React.PropTypes.array,
}

export default Program
