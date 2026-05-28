import { useCallback } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

export const ACTION_DETAIL_TAB_VALUES = ['usage', 'config'] as const

export type ActionDetailTab = (typeof ACTION_DETAIL_TAB_VALUES)[number]

const TAB_QUERY_PARAM = 'tab'
const DEFAULT_TAB: ActionDetailTab = 'usage'

const isActionDetailTab = (value: string | null): value is ActionDetailTab =>
    value !== null &&
    (ACTION_DETAIL_TAB_VALUES as readonly string[]).includes(value)

export const useActionDetailTab = () => {
    const location = useLocation()
    const history = useHistory()

    const param = new URLSearchParams(location.search).get(TAB_QUERY_PARAM)
    const tab: ActionDetailTab = isActionDetailTab(param) ? param : DEFAULT_TAB

    const setTab = useCallback(
        (next: ActionDetailTab) => {
            const params = new URLSearchParams(location.search)
            params.set(TAB_QUERY_PARAM, next)
            history.replace({ search: params.toString() })
        },
        [history, location.search],
    )

    return { tab, setTab }
}
