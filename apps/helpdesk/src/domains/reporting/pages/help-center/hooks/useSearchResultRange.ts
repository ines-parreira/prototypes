import { useMemo } from 'react'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { searchResultRangeQueryFactory } from 'domains/reporting/models/queryFactories/help-center/searchResult'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OneDimensionalDataItem } from 'domains/reporting/pages/types'

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
