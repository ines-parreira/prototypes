import {useEffect, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'

export function useCleanStatsFilters(statsFilters: StatsFilters) {
    const [cleanStatsFilters, setCleanStatsFilters] = useState(statsFilters)
    const isFilterDirty = useAppSelector<boolean>(
        (state) => state.ui.stats.isFilterDirty
    )

    useEffect(() => {
        if (!isFilterDirty) {
            setCleanStatsFilters(statsFilters)
        }
    }, [isFilterDirty, statsFilters])

    return cleanStatsFilters
}
