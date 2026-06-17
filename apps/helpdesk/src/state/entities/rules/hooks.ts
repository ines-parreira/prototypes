import { useEffect } from 'react'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { fetchRules } from 'models/rule/resources'

import { rulesFetched } from './actions'
import { rulesSelector } from './selectors'
import type { RulesState } from './types'

let loading = false

export const useRules = (): [RulesState | null, boolean] => {
    const dispatch = useAppDispatch()
    const rules = useAppSelector(rulesSelector)

    useEffect(() => {
        if (!Object.keys(rules).length && !loading) {
            try {
                loading = true
                void fetchRules().then((res) => {
                    loading = false
                    dispatch(rulesFetched(res.data))
                })
            } catch {
                toast.error('Failed to fetch rules')
            }
        }
    }, [dispatch, rules])

    return [Object.keys(rules).length ? rules : null, loading]
}
