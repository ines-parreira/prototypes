import {
    filterTicketsByTagId,
    getTagValuesByOperator,
} from 'hooks/reporting/helpers'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import {
    MetricPerDimensionTrend,
    QueryReturnType,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { TicketTagsEnrichedCube } from 'models/reporting/cubes/TicketTagsEnrichedCube'
import { tagsTicketCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

export const filterDataWithSelectedTags = ({
    tagResultsSelection,
    statsFilters,
    data,
}: {
    statsFilters: StatsFilters
    data: {
        value: QueryReturnType<TicketTagsEnrichedCube>
        prevValue: QueryReturnType<TicketTagsEnrichedCube>
    }
    tagResultsSelection: TagSelection
}): {
    value: QueryReturnType<TicketTagsEnrichedCube>
    prevValue: QueryReturnType<TicketTagsEnrichedCube>
} => {
    const tags = getTagValuesByOperator(statsFilters)

    if (tagResultsSelection === TagSelection.includeTags || tags.length === 0) {
        return data
    }

    return {
        value: filterTicketsByTagId(data.value, tags),
        prevValue: filterTicketsByTagId(data.prevValue, tags),
    }
}

export const useTagsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting: OrderDirection,
): MetricPerDimensionTrend => {
    const [tagResultsSelection] = useTagResultsSelection()

    const currentPeriod = useMetricPerDimension(
        tagsTicketCountQueryFactory(statsFilters, timezone, sorting),
    )

    const previousPeriod = useMetricPerDimension(
        tagsTicketCountQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting,
        ),
    )

    return {
        data: filterDataWithSelectedTags({
            tagResultsSelection,
            statsFilters,
            data: {
                value: currentPeriod?.data?.allData ?? [],
                prevValue: previousPeriod?.data?.allData ?? [],
            },
        }),
        isError: currentPeriod.isError || previousPeriod.isError,
        isFetching: currentPeriod.isFetching || previousPeriod.isFetching,
    }
}
