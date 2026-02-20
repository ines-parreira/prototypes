import type { ComponentProps } from 'react'
import React from 'react'

import classnames from 'classnames'
import type { List, Map } from 'immutable'

import type { RuleItemActions } from '../../../../settings/rules/types'
import useHoverable from '../../../hooks/useHoverable'
import Expression from '../expression/Expression'
import DeleteBlockStatementItem from '../operations/DeleteBlockStatementItem'

type Props = {
    rule: Map<any, any>
    expression: Partial<ComponentProps<typeof Expression>>
    parent: List<any>
    actions: RuleItemActions
    schemas: Map<any, any>
    depth: number
}

export default function ExpressionStatement({
    expression,
    rule,
    actions,
    parent,
    schemas,
    depth,
}: Props) {
    const parentNew = parent.push('expression')
    const { hovered, setRef } = useHoverable()
    return (
        <span ref={setRef}>
            <div
                className={classnames('ExpressionStatement', { hovered })}
                style={{ minHeight: 32, alignItems: 'center' }}
            >
                <DeleteBlockStatementItem
                    parent={parent}
                    rule={rule}
                    actions={actions}
                    isDisplayed={hovered}
                    type="action"
                />
                <Expression
                    {...(expression as ComponentProps<typeof Expression>)}
                    parent={parentNew}
                    rule={rule}
                    actions={actions}
                    schemas={schemas}
                    depth={depth}
                />
            </div>
        </span>
    )
}
