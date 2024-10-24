import {useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {fetchRules} from 'models/rule/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {rulesFetched} from './actions'
import {rulesSelector} from './selectors'
import {RulesState} from './types'

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
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch rules',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    }, [dispatch, rules])

    return [Object.keys(rules).length ? rules : null, loading]
}
