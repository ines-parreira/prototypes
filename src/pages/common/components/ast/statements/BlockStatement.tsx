import React, {ComponentProps} from 'react'
import {List, Map} from 'immutable'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import Hoverable from '../../Hoverable.js'

import Statement from './Statement'

type BlockStatementItemProps = {
    rule: Map<any, any>
    actions: RuleItemActions
    body: Partial<BlockStatementItemProps>
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}

class _BlockStatementItem extends React.Component<BlockStatementItemProps> {
    render() {
        const {actions, body, rule, parent, schemas, depth} = this.props

        return (
            <div className="BlockStatementItem">
                <Statement
                    {...(body as ComponentProps<typeof Statement>)}
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

const BlockStatementItem = Hoverable(_BlockStatementItem)

export default class BlockStatement extends React.Component<
    BlockStatementProps
> {
    _renderStatements = () => {
        const {body, rule, actions, parent, schemas, depth} = this.props

        return body.map((bodyItem, idx) => (
            //@ts-ignore
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
    rule: Map<any, any>
    actions: RuleItemActions
    body: BlockStatementItemProps[]
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}
