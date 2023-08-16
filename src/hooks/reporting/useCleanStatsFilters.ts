import {useEffect} from 'react'
import _isEqual from 'lodash/isEqual'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {statFiltersCleanWithPayload} from 'state/ui/stats/actions'
import {getCleanStatsFilters, isCleanStatsDirty} from 'state/ui/stats/selectors'

export function useCleanStatsFilters(statsFilters: StatsFilters) {
    const cleanStatsFilters = useAppSelector(getCleanStatsFilters)
    const isFilterDirty = useAppSelector(isCleanStatsDirty)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!isFilterDirty && !_isEqual(cleanStatsFilters, statsFilters)) {
            dispatch(statFiltersCleanWithPayload(statsFilters))
        }
    }, [cleanStatsFilters, dispatch, isFilterDirty, statsFilters])

    return cleanStatsFilters ?? statsFilters
}
