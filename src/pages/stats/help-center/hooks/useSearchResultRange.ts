import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { searchResultRangeQueryFactory } from 'models/reporting/queryFactories/help-center/searchResult'
import { StatsFilters } from 'models/stat/types'

import { OneDimensionalDataItem } from '../../types'

type CubeJsDateItem = {
    label: string | null
    value: number
}

const isLabelExist = (item: CubeJsDateItem): item is OneDimensionalDataItem =>
    !!item.label

export const useSearchResultRange = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const searchData = useMetricPerDimension(
        searchResultRangeQueryFactory(statsFilters, timezone),
    )

    return useMemo(
        () => ({
            data:
                searchData.data?.allData
                    .map((data) => ({
                        label: data[
                            HelpCenterTrackingEventDimensions.SearchResultRange
                        ],
                        value: Number(
                            data[
                                HelpCenterTrackingEventMeasures
                                    .SearchRequestedCount
                            ],
                        ),
                    }))
                    .filter(isLabelExist) ?? [],
            isLoading: searchData.isFetching,
        }),
        [searchData.data?.allData, searchData.isFetching],
    )
}
