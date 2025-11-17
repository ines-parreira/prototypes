import type { ComponentType } from 'react'
import { createContext } from 'react'

import type { List, Map } from 'immutable'

import type { RuleItemActions } from 'pages/settings/rules/types'

import type { BlockStatementItemProps } from '../../components/ast/types'

export type ExpressionProps = {
    actions: RuleItemActions
    className?: string
    parent: List<any>
    rule: Map<any, any>
    schemas: Map<any, any>
    leftsiblings?: Maybe<List<any>>
    type: string
    depth?: number
    elements?: React.ReactNode
}

export type StatementProps = {
    parent: List<any>
    type: string
    schemas: Map<any, any>
    depth: number
    rule: Map<any, any>
    actions: RuleItemActions
    body: BlockStatementItemProps[]
}

type RuleContextType = {
    Expression: ComponentType<ExpressionProps>
    Statement: ComponentType<StatementProps>
}

export const RuleContext = createContext<RuleContextType | undefined>(undefined)
