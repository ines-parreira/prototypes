import type { ComponentProps } from 'react'
import React from 'react'

import type { List, Map } from 'immutable'

import Foldable from 'pages/common/components/ast/Foldable/Foldable'
import AddActionOrIfStatement from 'pages/common/components/ast/operations/AddActionOrIfStatement'
import type { StatementProps } from 'pages/common/hooks/rule/RuleProvider'
import { useRuleContext } from 'pages/common/hooks/useRuleContext'
import type { RuleItemActions } from 'pages/settings/rules/types'

import type BlockStatement from './BlockStatement'

type AlternateStatementProps = {
    rule: Map<any, any>
    actions: RuleItemActions
    alternate: Partial<ComponentProps<typeof BlockStatement>>
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}

export default function AlternateStatement({
    actions,
    alternate,
    rule,
    parent,
    schemas,
    depth,
}: AlternateStatementProps) {
    const { Statement } = useRuleContext()

    return (
        <div className="alternate">
            <Foldable
                label={
                    <AddActionOrIfStatement
                        actions={actions}
                        rule={rule}
                        parent={parent.push('alternate')}
                        title="ELSE"
                        hoverableClassName="d-inline-flex"
                        depth={depth}
                        removable
                        empty={alternate.body?.length === 0}
                    />
                }
            >
                <Statement
                    {...(alternate as StatementProps)}
                    parent={parent.push('alternate')}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    depth={depth + 1}
                />
            </Foldable>
        </div>
    )
}
