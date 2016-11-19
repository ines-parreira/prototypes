import React from 'react'

import {List} from 'immutable'

import {Statement} from './statements'

class Program extends React.Component {

    _renderBody = () => {
        const {actions, body, rule} = this.props

        if (!body) {
            return
        }

        return body.map((statement, key) => (
            <Statement
                {...statement}
                key={key}
                parent={List(['body', key])}
                rule={rule}
                actions={actions}
            />
        ))
    }

    render() {
        return (
            <div className="ui segment Program">
                {this._renderBody()}
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
