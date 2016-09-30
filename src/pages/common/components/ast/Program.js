import React from 'react'

import { List } from 'immutable'

import { Statement } from './statements'

class Program extends React.Component {

    _renderBody = () => {
        const { actions, body, index, schemas } = this.props
        return body && body.map((statement, key) => (
            <Statement
                {...statement}
                key={key}
                parent={List(['body', key])}
                index={index}
                schemas={schemas}
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
    index: React.PropTypes.number,
    schemas: React.PropTypes.object,
    actions: React.PropTypes.object,
    body: React.PropTypes.array,
}

export default Program
