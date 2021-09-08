import client from '../api/resources'
import {ApiListResponsePagination} from '../api/types'

import {Rule, RuleDraft, RulePriority} from './types'

export const fetchRules = async (): Promise<
    ApiListResponsePagination<Rule[]>
> => {
    const res = await client.get('/api/rules/')
    return res.data as ApiListResponsePagination<Rule[]>
}

export const fetchRule = async (id: number): Promise<Rule> => {
    const res = await client.get(`/api/rules/${id}/`)
    return res.data as Rule
}

export const createRule = async (rule: RuleDraft): Promise<Rule> => {
    const res = await client.post('/api/rules/', rule)
    return res.data as Rule
}

export const updateRule = async (
    rule: RuleDraft & {id: number}
): Promise<Rule> => {
    const res = await client.put(`/api/rules/${rule.id}/`, rule)
    return res.data as Rule
}

export const deleteRule = async (id: number): Promise<void> => {
    await client.delete(`/api/rules/${id}/`)
}

export const reorderRules = async (
    priorities: RulePriority[]
): Promise<Rule[]> => {
    const res = await client.post('/api/rules/priorities/', {priorities})
    return res.data as Rule[]
}

export const deactivateRule = async (rule: Rule): Promise<Rule> => {
    const {id} = rule

    const res = await client.put(`/api/rules/${id}/`, {
        ...rule,
        deactivated_datetime: new Date(),
    })
    return res.data as Rule
}

export const activateRule = async (rule: Rule): Promise<Rule> => {
    const {id} = rule
    const res = await client.put(`/api/rules/${id}/`, {
        ...rule,
        deactivated_datetime: null,
    })
    return res.data as Rule
}
