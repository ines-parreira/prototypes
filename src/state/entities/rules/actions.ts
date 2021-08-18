import {createAction} from '@reduxjs/toolkit'

import {Rule, RulePriority, RuleASTPayload} from '../../../models/rule/types'

import {
    RULE_CREATED,
    RULE_DELETED,
    RULE_FETCHED,
    RULE_UPDATED,
    RULES_FETCHED,
    RULES_REORDERED,
    RULE_AST_UPDATED,
} from './constants'

export const ruleCreated = createAction<Rule>(RULE_CREATED)

export const ruleDeleted = createAction<number>(RULE_DELETED)

export const ruleFetched = createAction<Rule>(RULE_FETCHED)

export const ruleUpdated = createAction<Rule>(RULE_UPDATED)

export const rulesFetched = createAction<Rule[]>(RULES_FETCHED)

export const rulesReordered = createAction<RulePriority[]>(RULES_REORDERED)

export const ruleAstUpdated = createAction<RuleASTPayload>(RULE_AST_UPDATED)
