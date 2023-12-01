import {List, Map} from 'immutable'

import {RuleItemActions} from 'pages/settings/rules/types'

export type BlockStatementItemProps = {
    rule: Map<any, any>
    actions: RuleItemActions
    body: Partial<BlockStatementItemProps>
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}
export type BlockStatementProps = {
    rule: Map<any, any>
    actions: RuleItemActions
    body: BlockStatementItemProps[]
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}
export type ConsequentStatementProps = {
    rule: Map<any, any>
    actions: RuleItemActions
    consequent: Partial<BlockStatementProps>
    parent: List<any>
    schemas: Map<any, any>
    depth: number
}
