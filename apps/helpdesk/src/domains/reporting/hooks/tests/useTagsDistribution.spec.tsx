import { assumeMock, renderHook } from '@repo/testing'

import { useTagsTicketCount } from 'domains/reporting/hooks/metricsPerPeriod'
import { useTagsDistribution } from 'domains/reporting/hooks/support-performance/useTagsDistribution'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { getTagName } from 'domains/reporting/pages/ticket-insights/tags/helpers'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import useAppSelector from 'hooks/useAppSelector'

const firstTagID = '255148'
const secondTagID = '487270'

jest.mock('domains/reporting/hooks/metricsPerPeriod')
jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('state/entities/tags/selectors')
const useTagsTicketCountMock = assumeMock(useTagsTicketCount)
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

const mockValue = {
    data: {
        value: [
            {
                [TicketTagsEnrichedDimension.TagId]: firstTagID,
                [TicketTagsEnrichedMeasure.TicketCount]: '20',
            },
            {
                [TicketTagsEnrichedDimension.TagId]: secondTagID,
                [TicketTagsEnrichedMeasure.TicketCount]: '20',
            },
            {
                [TicketTagsEnrichedDimension.TagId]: 'third',
                [TicketTagsEnrichedMeasure.TicketCount]: '20',
            },
        ],
        prevValue: [
            {
                [TicketTagsEnrichedDimension.TagId]: firstTagID,
                [TicketTagsEnrichedMeasure.TicketCount]: '40',
            },
            {
                [TicketTagsEnrichedDimension.TagId]: secondTagID,
                [TicketTagsEnrichedMeasure.TicketCount]: '5',
            },
            {
                [TicketTagsEnrichedDimension.TagId]: 'third',
                [TicketTagsEnrichedMeasure.TicketCount]: '5',
            },
        ],
    },
    isFetching: false,
    isError: false,
}

describe('useTagsDistribution useAppSelectorMock', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({
            cleanStatsFilters: initialState.filters,
            userTimezone: '',
        })
        useAppSelectorMock.mockReturnValue({
            [firstTagID]: { name: 'TAG1' },
            [secondTagID]: { name: 'TAG2' },
        })
        useTagsTicketCountMock.mockReturnValue(mockValue)
    })

    it('should return calculated data', () => {
        const { result } = renderHook(() => useTagsDistribution(2))

        expect(useTagsTicketCountMock).toHaveBeenCalled()

        expect(result.current).toStrictEqual({
            isFetching: false,
            data: [
                {
                    category: firstTagID,
                    gaugePercentage: 100,
                    name: 'TAG1',
                    previousValueInPercentage: 66.66666666666666,
                    valueInPercentage: 33.33333333333333,
                    value: 20,
                },
                {
                    category: secondTagID,
                    gaugePercentage: 100,
                    name: 'TAG2',
                    previousValueInPercentage: 8.333333333333332,
                    valueInPercentage: 33.33333333333333,
                    value: 20,
                },
            ],
        })
    })

    it('should return calculated data with default topAmount', () => {
        useTagsTicketCountMock.mockReturnValue({
            ...mockValue,
            data: {
                value: [mockValue.data.value[0]],
                prevValue: [mockValue.data.prevValue[0]],
            },
        })

        const { result } = renderHook(() => useTagsDistribution())

        expect(result.current).toStrictEqual({
            isFetching: false,
            data: [
                {
                    category: firstTagID,
                    gaugePercentage: 100,
                    name: 'TAG1',
                    previousValueInPercentage: 200,
                    valueInPercentage: 100,
                    value: 20,
                },
            ],
        })
    })

    it('should return the tag id instead of name for a missing Tag', () => {
        const unknownTagId = 'unknown_tag_id'
        useTagsTicketCountMock.mockReturnValue({
            ...mockValue,
            data: {
                value: [
                    {
                        ...mockValue.data.value[0],
                        [TicketTagsEnrichedDimension.TagId]: unknownTagId,
                    },
                ],
                prevValue: [
                    {
                        ...mockValue.data.prevValue[0],
                        [TicketTagsEnrichedDimension.TagId]: unknownTagId,
                    },
                ],
            },
        })

        const { result } = renderHook(() => useTagsDistribution())

        expect(result.current).toStrictEqual({
            isFetching: false,
            data: [
                {
                    category: unknownTagId,
                    gaugePercentage: 100,
                    name: getTagName({ id: unknownTagId }),
                    previousValueInPercentage: 200,
                    valueInPercentage: 100,
                    value: 20,
                },
            ],
        })
    })

    it('should return 0 if theres no ticketCountField key', () => {
        useTagsTicketCountMock.mockReturnValue({
            ...mockValue,
            data: {
                value: [{}],
                prevValue: [{}],
            },
        })

        const { result } = renderHook(() => useTagsDistribution())

        expect(result.current).toStrictEqual({
            isFetching: false,
            data: [
                {
                    category: undefined,
                    gaugePercentage: 0,
                    name: getTagName({ id: '' }),
                    previousValueInPercentage: 0,
                    valueInPercentage: 0,
                    value: 0,
                },
            ],
        })
    })

    it('should return an ampty array if theres no data', () => {
        useTagsTicketCountMock.mockReturnValue({
            ...mockValue,
            data: {
                value: [],
                prevValue: [],
            },
        })

        const { result } = renderHook(() => useTagsDistribution())

        expect(result.current).toStrictEqual({
            isFetching: false,
            data: [],
        })
    })
})
