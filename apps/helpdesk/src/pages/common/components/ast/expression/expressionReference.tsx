import React, { ComponentType } from 'react'

import { List, Map } from 'immutable'

import { RuleItemActions } from 'pages/settings/rules/types'

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
