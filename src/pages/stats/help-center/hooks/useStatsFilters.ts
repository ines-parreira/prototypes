import {useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {LegacyStatsFilters} from 'models/stat/types'
import useAppSelector from 'hooks/useAppSelector'
import {getPageStatsFilters} from 'state/stats/selectors'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {mergeStatsFilters} from 'state/stats/statsSlice'

export const useStatsFilters = (initialState: Partial<LegacyStatsFilters>) => {
    const dispatch = useDispatch()
    const statsFilters = useAppSelector(getPageStatsFilters)
    const cleanStatsFilters = useCleanStatsFilters(statsFilters)

    const setSelectedFilter = useCallback(
        (filter: Partial<LegacyStatsFilters>) => {
            dispatch(mergeStatsFilters(filter))
        },
        [dispatch]
    )

    useEffect(() => {
        dispatch(mergeStatsFilters(initialState))
    }, [initialState, dispatch])

    return [cleanStatsFilters, setSelectedFilter] as const
}
