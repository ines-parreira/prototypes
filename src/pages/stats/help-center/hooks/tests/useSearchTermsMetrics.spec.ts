import {renderHook} from '@testing-library/react-hooks'
import {useMetric} from 'hooks/reporting/useMetric'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {useSearchTermsMetrics} from '../useSearchTermsMetrics'

jest.mock('hooks/reporting/useMetric', () => ({
    useMetric: jest.fn(),
}))
jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))

const mockUseMetric = jest.mocked(useMetric)
const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)

const statsFilters = {
    period: {
        start_datetime: '2020-01-16T03:04:56.789-10:00',
        end_datetime: '2020-01-02T03:04:56.789-10:00',
    },
}
const timezone = 'UTC'
const itemPerPage = 10
const currentPage = 1

describe('useSearchTermsMetrics', () => {
    beforeEach(() => {
        mockUseMetric.mockReturnValue({isFetching: false, isError: false})
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [],
                decile: null,
            },
        })
    })

    it('should call metric hook with correct params', () => {
        renderHook(() =>
            useSearchTermsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
                onModalOpen: jest.fn(),
            })
        )

        expect(mockUseMetric).toHaveBeenCalledWith({
            dimensions: [],
            filters: [
                {
                    member: HelpCenterTrackingEventMember.PeriodStart,
                    operator: 'afterDate',
                    values: ['2020-01-16T03:04:56.789'],
                },
                {
                    member: HelpCenterTrackingEventMember.PeriodEnd,
                    operator: 'beforeDate',
                    values: ['2020-01-02T03:04:56.789'],
                },
            ],
            measures: [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
            segments: [HelpCenterTrackingEventSegment.SearchRequestedOnly],
            timezone: timezone,
        })
    })

    it('should return total', () => {
        mockUseMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 10},
        })
        const {result} = renderHook(() =>
            useSearchTermsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
                onModalOpen: jest.fn(),
            })
        )

        expect(result.current).toEqual({
            total: 10,
            isLoading: false,
            data: [],
        })
    })

    it('should return formatted data', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount]:
                            '10',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount]:
                            '5',
                        [HelpCenterTrackingEventDimensions.SearchQuery]:
                            'report issue',
                    },
                ],
                decile: null,
            },
        })
        const mockOnModalOpen = jest.fn()
        const {result} = renderHook(() =>
            useSearchTermsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
                onModalOpen: mockOnModalOpen,
            })
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [
                [
                    {
                        type: 'string',
                        value: 'report issue',
                    },
                    {
                        type: 'number',
                        value: 10,
                    },
                    {
                        onClick: expect.anything(),
                        type: 'number',
                        value: 5,
                    },
                    {
                        type: 'percent',
                        value: 50,
                    },
                ],
            ],
        })
    })

    it('should return null for each field when data is empty', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [{}],
                decile: null,
            },
        })
        const {result} = renderHook(() =>
            useSearchTermsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
                onModalOpen: jest.fn(),
            })
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [
                [
                    {
                        type: 'string',
                        value: null,
                    },
                    {
                        type: 'number',
                        value: null,
                    },
                    {
                        type: 'number',
                        value: null,
                    },
                    {
                        type: 'percent',
                        value: null,
                    },
                ],
            ],
        })
    })

    it('should return an empty array when no data from api', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: null,
        })
        const {result} = renderHook(() =>
            useSearchTermsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
                onModalOpen: jest.fn(),
            })
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [],
        })
    })
})
