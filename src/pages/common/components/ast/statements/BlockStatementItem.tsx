import React from 'react'

import Hoverable from '../../Hoverable'

import {BlockStatementItemProps} from '../types'
import {StatementProps, statementReference} from './statementReference'

const BlockStatementItem = ({
    actions,
    body,
    rule,
    parent,
    schemas,
    depth,
}: BlockStatementItemProps) => {
    const {Statement} = statementReference

    return (
        <div className="BlockStatementItem">
            <Statement
                {...(body as StatementProps)}
                parent={parent}
                rule={rule}
                schemas={schemas}
                actions={actions}
                depth={depth}
            />
        </div>
    )
}
export default Hoverable(BlockStatementItem)
