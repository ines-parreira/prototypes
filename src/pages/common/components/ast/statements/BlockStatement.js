// @flow
import React from 'react'
import type {List} from 'immutable'

import Hoverable from '../../Hoverable'

import Statement from './Statement'

class _BlockStatementItem extends React.Component<BlockStatementItemProps> {
    render() {
        const {actions, body, rule, parent, schemas, depth} = this.props

        return (
            <div className="BlockStatementItem">
                <Statement
                    {...body}
                    parent={parent}
                    rule={rule}
                    schemas={schemas}
                    actions={actions}
                    depth={depth}
                />
            </div>
        )
    }
}

type BlockStatementItemProps = {
    rule: Object,
    actions: Object,
    body: Object,
    parent: List<*>,
    schemas: Object,
    depth: number,
}

class BlockStatementItem extends Hoverable(_BlockStatementItem) {}

export default class BlockStatement extends React.Component<BlockStatementProps> {
    _renderStatements = () => {
        const {body, rule, actions, parent, schemas, depth} = this.props

        return body.map((bodyItem, idx) => (
            <BlockStatementItem
                key={idx}
                actions={actions}
                body={bodyItem}
                rule={rule}
                parent={parent.push('body', idx)}
                schemas={schemas}
                depth={depth}
            />
        ))
    }

    render() {
        return <div className="BlockStatement">{this._renderStatements()}</div>
    }
}

type BlockStatementProps = {
    rule: Object,
    actions: Object,
    body: Object,
    parent: List<*>,
    schemas: Object,
    depth: number,
}
