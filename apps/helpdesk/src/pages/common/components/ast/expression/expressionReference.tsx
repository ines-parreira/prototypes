import type { ComponentType } from 'react'
import type React from 'react'

import type { List, Map } from 'immutable'

import type { RuleItemActions } from 'pages/settings/rules/types'

export type ExpressionProps = {
    actions: RuleItemActions
    className?: string
    parent: List<any>
    rule: Map<any, any>
    schemas: Map<any, any>
    leftsiblings: Maybe<List<any>>
    type: string
    depth: number
    elements?: React.ReactNode
}

// this is to a circular dependency while doing recursion
export const expressionReference: {
    Expression: ComponentType<ExpressionProps>
} = { Expression: () => <></> }
