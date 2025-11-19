import {
    filterTicketsByTagId,
    getTagValuesByOperator,
} from 'domains/reporting/hooks/helpers'
import {
    TagSelection,
    useTagResultsSelection,
} from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import type {
    MetricPerDimensionTrend,
    QueryReturnType,
    StringWhichShouldBeNumber,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import type { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import {
    tagsTicketCountOnCreatedDatetimeQueryFactory,
    tagsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const filterDataWithSelectedTags = ({
    tagResultsSelection,
    statsFilters,
    data,
}: {
    statsFilters: StatsFilters
    data: {
        value: QueryReturnType<string, TicketTagsEnrichedCube>
        prevValue: QueryReturnType<string, TicketTagsEnrichedCube>
    }
    tagResultsSelection: TagSelection
}): {
    value: QueryReturnType<string, TicketTagsEnrichedCube>
    prevValue: QueryReturnType<string, TicketTagsEnrichedCube>
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
    const [tagTicketTimeReference] = useTicketTimeReference(Entity.Tag)

    const queryFactory =
        tagTicketTimeReference === TicketTimeReference.CreatedAt
            ? tagsTicketCountOnCreatedDatetimeQueryFactory
            : tagsTicketCountQueryFactory

    const currentPeriod = useMetricPerDimension<StringWhichShouldBeNumber>(
        queryFactory(statsFilters, timezone, sorting),
    )

    const previousPeriod = useMetricPerDimension<StringWhichShouldBeNumber>(
        queryFactory(
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
