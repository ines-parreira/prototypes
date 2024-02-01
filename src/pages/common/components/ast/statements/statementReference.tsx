import {List, Map} from 'immutable'
import React, {ComponentType} from 'react'

import {RuleItemActions} from 'pages/settings/rules/types'
import {BlockStatementItemProps} from '../types'

export type StatementProps = {
    parent: List<any>
    type: string
    schemas: Map<any, any>
    depth: number
    rule: Map<any, any>
    actions: RuleItemActions
    body: BlockStatementItemProps[]
}

// this is to a circular dependency while doing recursion
export const statementReference: {
    Statement: ComponentType<StatementProps>
} = {Statement: () => <></>}
