import React from 'react'

import {useRuleContext} from 'pages/common/hooks/useRuleContext'
import {StatementProps} from 'pages/common/hooks/rule/RuleProvider'
import {BlockStatementItemProps} from '../types'

export default function BlockStatementItem({
    actions,
    body,
    rule,
    parent,
    schemas,
    depth,
}: BlockStatementItemProps) {
    const {Statement} = useRuleContext()

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
