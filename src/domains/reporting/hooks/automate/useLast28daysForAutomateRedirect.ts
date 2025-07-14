import { useEffect } from 'react'

import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import { useSearchParam } from 'hooks/useSearchParam'
import { last28DaysStatsFilters } from 'pages/automate/common/utils/last28DaysStatsFilters'

export const useLast28daysForAutomateRedirect = () => {
    const dispatch = useAppDispatch()
    const [sourceSearchParam, setSourceSearchParam] = useSearchParam('source')

    useEffect(() => {
        if (sourceSearchParam === 'automate') {
            dispatch(
                mergeStatsFiltersWithLogicalOperator(last28DaysStatsFilters()),
            )
            setSourceSearchParam(null)
        }
    }, [dispatch, sourceSearchParam, setSourceSearchParam])
}
