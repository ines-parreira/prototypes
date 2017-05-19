import React from 'react'

import Hoverable from '../../Hoverable'
import Statement from './Statement'


let BlockStatementItem = ({actions, body, rule, parent, schemas}) => (
    <div className="BlockStatementItem">
        <Statement
            {...body}
            parent={parent}
            rule={rule}
            schemas={schemas}
            actions={actions}
        />
    </div>
)

BlockStatementItem.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object,
    body: React.PropTypes.object,
    parent: React.PropTypes.object,
    schemas: React.PropTypes.object,
}

BlockStatementItem = Hoverable(BlockStatementItem)

class BlockStatement extends React.Component {

    _renderStatements = () => {
        const {body, rule, actions, parent, schemas} = this.props

        return body.map((bodyItem, idx) => (
            <div className="BlockStatementItem" key={idx}>
                <BlockStatementItem
                    actions={actions}
                    body={bodyItem}
                    rule={rule}
                    parent={parent.push('body', idx)}
                    schemas={schemas}
                />
            </div>
        ))
    }

    render() {
        return (
            <div className="BlockStatement">
                {this._renderStatements()}
            </div>
        )
    }
}

BlockStatement.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    body: React.PropTypes.array.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default BlockStatement
