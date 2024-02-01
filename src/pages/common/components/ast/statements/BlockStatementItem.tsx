import React from 'react'

import {BlockStatementItemProps} from '../types'
import {StatementProps, statementReference} from './statementReference'

export default function BlockStatementItem({
    actions,
    body,
    rule,
    parent,
    schemas,
    depth,
}: BlockStatementItemProps) {
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
