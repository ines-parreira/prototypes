import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    filterDataWithSelectedTags,
    useTagsTicketCount,
} from 'hooks/reporting/metricsPerPeriod'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import { useTicketTimeReference } from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import {
    QueryReturnType,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    TicketTagsEnrichedCube,
    TicketTagsEnrichedDimension,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import {
    tagsTicketCountOnCreatedDatetimeQueryFactory,
    tagsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
    TicketTimeReference,
} from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { defaultStatsFilters } from 'state/stats/statsSlice'
import { getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const periodStart = moment()
const periodEnd = periodStart.add(7, 'days')
const statsFilters: StatsFilters = {
    period: {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    },
    channels: withDefaultLogicalOperator([
        TicketChannel.Email,
        TicketChannel.Chat,
    ]),
    integrations: withDefaultLogicalOperator([1]),
    tags: [
        {
            ...withDefaultLogicalOperator([1, 2]),
            filterInstanceId: TagFilterInstanceId.First,
        },
    ],
}
const timezone = 'someTimeZone'
const sorting = OrderDirection.Asc

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
jest.mock('hooks/reporting/tags/useTagResultsSelection')
const useTagResultsSelectionMock = assumeMock(useTagResultsSelection)

const setTagResultsSelection = jest.fn()

jest.mock('hooks/reporting/ticket-insights/useTicketTimeReference')
const useTicketTimeReferenceMock = assumeMock(useTicketTimeReference)

describe('useTagsTicketCount', () => {
    beforeEach(() => {
        useTagResultsSelectionMock.mockReturnValue([
            TagSelection.includeTags,
            setTagResultsSelection,
        ])

        useTicketTimeReferenceMock.mockReturnValue([
            TicketTimeReference.TaggedAt,
            jest.fn(),
        ])
    })

    it('should pass the query to useMetricPerDimension hook', () => {
        renderHook(() => useTagsTicketCount(statsFilters, timezone, sorting))

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountQueryFactory(statsFilters, timezone, sorting),
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
                sorting,
            ),
        )
    })

    it('should pass the query to useMetricPerDimension hook when time reference is created at', () => {
        useTicketTimeReferenceMock.mockReturnValue([
            TicketTimeReference.CreatedAt,
            jest.fn(),
        ])

        renderHook(() => useTagsTicketCount(statsFilters, timezone, sorting))

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountOnCreatedDatetimeQueryFactory(
                statsFilters,
                timezone,
                sorting,
            ),
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            tagsTicketCountOnCreatedDatetimeQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
                sorting,
            ),
        )
    })

    it('should test the returned result of useTagsTicketCount', () => {
        const responseMock = {
            data: { allData: [], value: null, decile: null },
            isFetching: false,
            isError: false,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)
        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)

        const { result } = renderHook(() =>
            useTagsTicketCount(statsFilters, timezone, sorting),
        )

        expect(result.current).toStrictEqual({
            data: { prevValue: [], value: [] },
            isError: responseMock.isError,
            isFetching: responseMock.isFetching,
        })
    })

    it('should return filtered data if tagResultsSelection is equal to TagSelection.excludeTags', () => {
        useTagResultsSelectionMock.mockReturnValue([
            TagSelection.excludeTags,
            setTagResultsSelection,
        ])

        const responseMock = {
            data: {
                allData: [
                    {
                        [TicketTagsEnrichedDimension.TagId]: '1',
                        'TicketTagsEnriched.ticketCount': '23',
                        decile: '7',
                    },
                    {
                        [TicketTagsEnrichedDimension.TagId]: '3',
                        'TicketTagsEnriched.ticketCount': '25',
                        decile: '7',
                    },
                ],
                value: null,
                decile: null,
            },
            isFetching: false,
            isError: false,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)
        useMetricPerDimensionMock.mockReturnValueOnce(responseMock)

        const { result } = renderHook(() =>
            useTagsTicketCount(statsFilters, timezone, sorting),
        )

        expect(result.current).toStrictEqual({
            data: {
                prevValue: [responseMock.data.allData[0]],
                value: [responseMock.data.allData[0]],
            },
            isError: responseMock.isError,
            isFetching: responseMock.isFetching,
        })
    })

    it('should return isError:true', () => {
        const errorMock = {
            data: { allData: [], value: null, decile: null },
            isFetching: false,
            isError: true,
        }

        useMetricPerDimensionMock.mockReturnValueOnce(errorMock)
        useMetricPerDimensionMock.mockReturnValueOnce(errorMock)

        const { result } = renderHook(() =>
            useTagsTicketCount(statsFilters, timezone, sorting),
        )

        expect(result.current).toStrictEqual({
            data: { prevValue: [], value: [] },
            isError: errorMock.isError,
            isFetching: errorMock.isFetching,
        })
    })
})

describe('filterDataWithSelectedTags', () => {
    const firstTagId = 525510
    const secondTagId = 658573
    const thirdTagId = 714422
    const data = [
        {
            [TicketTagsEnrichedDimension.TagId]: firstTagId.toString(),
            'TicketTagsEnriched.ticketCount': '32',
            decile: '9',
        },
        {
            [TicketTagsEnrichedDimension.TagId]: '661191',
            'TicketTagsEnriched.ticketCount': '32',
            decile: '8',
        },
        {
            [TicketTagsEnrichedDimension.TagId]: secondTagId.toString(),
            'TicketTagsEnriched.ticketCount': '23',
            decile: '7',
        },
        {
            [TicketTagsEnrichedDimension.TagId]: '634254',
            'TicketTagsEnriched.ticketCount': '23',
            decile: '7',
        },
        {
            [TicketTagsEnrichedDimension.TagId]: thirdTagId.toString(),
            'TicketTagsEnriched.ticketCount': '5',
            decile: '6',
        },
    ] as QueryReturnType<TicketTagsEnrichedCube>

    const statsFilters = {
        ...defaultStatsFilters,
        tags: [
            {
                operator: LogicalOperatorEnum.ALL_OF,
                values: [secondTagId],
                filterInstanceId: TagFilterInstanceId.First,
            },
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [firstTagId],
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }

    const fullData = {
        value: data,
        prevValue: data,
    }

    it('should return the same data if tagResultsSelection is equal to TagSelection.includeTags', () => {
        const result = filterDataWithSelectedTags({
            data: fullData,
            statsFilters,
            tagResultsSelection: TagSelection.includeTags,
        })

        expect(result).toEqual(fullData)
    })

    it('should return data with tagIds from statsFilters', () => {
        const result = filterDataWithSelectedTags({
            data: fullData,
            statsFilters,
            tagResultsSelection: TagSelection.excludeTags,
        })

        expect(result).toEqual({
            value: [data[0], data[2]],
            prevValue: [data[0], data[2]],
        })
    })

    it('should return same data if theres no tagIds in statsFilters', () => {
        const result = filterDataWithSelectedTags({
            data: fullData,
            statsFilters: defaultStatsFilters,
            tagResultsSelection: TagSelection.excludeTags,
        })

        expect(result).toEqual(fullData)
    })

    it('should return same data if there are tags with ALL_OF or ONE_OF operators', () => {
        const result = filterDataWithSelectedTags({
            data: fullData,
            statsFilters: {
                ...defaultStatsFilters,
                tags: [
                    {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [firstTagId, secondTagId],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            },
            tagResultsSelection: TagSelection.excludeTags,
        })

        expect(result).toEqual(fullData)
    })
})
