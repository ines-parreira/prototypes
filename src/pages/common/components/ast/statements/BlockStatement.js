import React from 'react'

import Hoverable from '../../Hoverable'
import Statement from './Statement'
import { DeleteBlockStatementItem } from '../operations'


let BlockStatementItem = ({ actions, body, index, parent, schemas }, { hovered }) => (
    <div className="BlockStatementItem">
        {hovered && (
            <DeleteBlockStatementItem
                parent={parent}
                index={index}
                actions={actions}
            />
        )}
        <Statement
            {...body}
            parent={parent}
            index={index}
            schemas={schemas}
            actions={actions}
        />
    </div>
)

BlockStatementItem.propTypes = {
    actions: React.PropTypes.object,
    body: React.PropTypes.object,
    index: React.PropTypes.number,
    parent: React.PropTypes.object,
    schemas: React.PropTypes.object,
}

BlockStatementItem.contextTypes = {
    hovered: React.PropTypes.bool,
}

BlockStatementItem = Hoverable(BlockStatementItem)

class BlockStatement extends React.Component {

    _renderStatements = () => {
        const { body, index, actions, parent, schemas } = this.props

        return body.map((bodyItem, idx) => (
            <div className="BlockStatementItem" key={idx}>
                <BlockStatementItem
                    actions={actions}
                    body={bodyItem}
                    index={index}
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
    actions: React.PropTypes.object.isRequired,
    body: React.PropTypes.array.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
}

export default BlockStatement
