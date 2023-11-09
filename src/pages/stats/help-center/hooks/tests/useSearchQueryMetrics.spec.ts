import {renderHook} from '@testing-library/react-hooks'

import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {useSearchQueryMetrics} from '../useSearchQueryMetrics'

jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))

const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)

const statsFilters = {
    period: {
        start_datetime: '2020-01-16T03:04:56.789-10:00',
        end_datetime: '2020-01-02T03:04:56.789-10:00',
    },
}
const timezone = 'UTC'

describe('useSearchQueryMetrics', () => {
    beforeEach(() => {
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
        const searchQuery = 'searchQuery'
        renderHook(() =>
            useSearchQueryMetrics({
                statsFilters,
                timezone,
                searchQuery,
            })
        )

        expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: HelpCenterTrackingEventMember.SearchQuery,
                        operator: 'equals',
                        values: [searchQuery],
                    },
                ]),
                timezone: timezone,
            })
        )
    })

    it('should return formatted data', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.ArticleTitle]:
                            'How to report an issue',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount]:
                            '5',
                    },
                ],
                decile: null,
            },
        })
        const {result} = renderHook(() =>
            useSearchQueryMetrics({
                statsFilters,
                timezone,
                searchQuery: 'searchQuery',
            })
        )

        expect(result.current).toEqual({
            isLoading: false,
            data: [
                [
                    {
                        type: 'string',
                        value: 'How to report an issue',
                    },
                    {
                        type: 'number',
                        value: 5,
                    },
                ],
            ],
        })
    })

    it('should return null when data is empty', () => {
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
            useSearchQueryMetrics({
                statsFilters,
                timezone,
                searchQuery: 'searchQuery',
            })
        )

        expect(result.current).toEqual({
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
                ],
            ],
        })
    })
})
