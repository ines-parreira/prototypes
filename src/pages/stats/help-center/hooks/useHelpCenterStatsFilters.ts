import {useCallback, useMemo, useState} from 'react'
import {StatsFilters} from 'models/stat/types'

type HelpCenterStatsFilters = Required<
    Pick<StatsFilters, 'helpCenters' | 'period'>
>

export const useHelpCenterStatsFilters = (
    initialState: HelpCenterStatsFilters
) => {
    const [statsFilters, setStatsFilters] =
        useState<HelpCenterStatsFilters>(initialState)

    const setSelectedFilter = useCallback(
        (
            filterName: keyof HelpCenterStatsFilters,
            filter: Partial<HelpCenterStatsFilters>
        ) => {
            setStatsFilters((prevState) => ({
                ...prevState,
                [filterName]: filter[filterName],
            }))
        },
        []
    )

    return useMemo(
        () => ({
            statsFilters,
            setSelectedFilter,
        }),
        [setSelectedFilter, statsFilters]
    )
}
