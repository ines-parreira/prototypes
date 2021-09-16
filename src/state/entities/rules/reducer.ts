import {createReducer} from '@reduxjs/toolkit'

import {Rule, RulePriority} from '../../../models/rule/types'

import {RulesState} from './types'
import {
    ruleCreated,
    ruleDeleted,
    ruleFetched,
    ruleUpdated,
    rulesFetched,
    rulesReordered,
} from './actions'

const initialState: RulesState = {}

const rulesReducer = createReducer<RulesState>(initialState, (builder) =>
    builder
        .addCase(ruleCreated, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
        .addCase(ruleDeleted, (state, {payload}) => {
            delete state[payload.toString()]
        })
        .addCase(ruleFetched, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
        .addCase(ruleUpdated, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
        .addCase(rulesFetched, (state, {payload}) => {
            payload.map((rule: Rule) => {
                state[rule.id.toString()] = rule
            })
        })
        .addCase(rulesReordered, (state, {payload}) => {
            payload.map((rulePriority: RulePriority) => {
                state[rulePriority.id.toString()] = {
                    ...state[rulePriority.id.toString()],
                    priority: rulePriority.priority,
                }
            })
        })
)

export default rulesReducer
