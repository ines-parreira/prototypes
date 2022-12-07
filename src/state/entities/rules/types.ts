import {PayloadActionCreator} from '@reduxjs/toolkit'

import {Rule} from '../../../models/rule/types'

import {
    RULE_CREATED,
    RULE_DELETED,
    RULE_FETCHED,
    RULE_UPDATED,
    RULES_FETCHED,
} from './constants'

export type RulesState = {
    [key: string]: Rule
}

export type RulesAction =
    | RuleCreatedAction
    | RuleDeletedAction
    | RuleFetchedAction
    | RuleUpdatedAction
    | RulesFetchedAction

export type RuleCreatedAction = PayloadActionCreator<Rule, typeof RULE_CREATED>

export type RuleDeletedAction = PayloadActionCreator<
    string,
    typeof RULE_DELETED
>

export type RuleFetchedAction = PayloadActionCreator<Rule, typeof RULE_FETCHED>

export type RuleUpdatedAction = PayloadActionCreator<Rule, typeof RULE_UPDATED>

export type RulesFetchedAction = PayloadActionCreator<
    Rule[],
    typeof RULES_FETCHED
>

export type RuleSuggestionState = 'ignored' | 'accepted' | 'pending'
