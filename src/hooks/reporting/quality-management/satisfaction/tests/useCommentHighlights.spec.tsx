import {useQueries} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import moment from 'moment'
import React from 'react'
import {Provider} from 'react-redux'

import {agents} from 'fixtures/agents'
import {useCommentHighlights} from 'hooks/reporting/quality-management/satisfaction/useCommentHighlights'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {commentHighlightsQueryFactory} from 'models/reporting/queryFactories/satisfaction/commentHighlightsQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {RootState} from 'state/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock('@tanstack/react-query')
const useQueriesMock = assumeMock(useQueries)

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('useCommentHighlights', () => {
    const agentsMockReturnedValues = [
        {
            id: 1,
            name: 'John Doe',
            meta: {profile_picture_url: 'http://image.url'},
        },
    ]

    const allDataDummy = [
        {
            [TicketDimension.TicketId]: '1',
            [TicketDimension.AssigneeUserId]: '1',
            [TicketSatisfactionSurveyDimension.SurveyCustomerId]: '10',
            [TicketDimension.SurveyScore]: '5',
            [TicketSatisfactionSurveyDimension.SurveyComment]: 'Great service',
        },
    ]

    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const queryScores = ['1', '2', '3', '4', '5']

    const emptyMetricPerDimensionReturnValue = {
        data: null,
        isError: false,
        isFetching: false,
    }

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
        ui: {stats: {filters: {cleanStatsFilters: statsFilters}}},
    } as RootState

    beforeEach(() => {
        useMetricPerDimensionMock.mockReturnValue(
            emptyMetricPerDimensionReturnValue
        )
        useQueriesMock.mockReturnValue([])
        useAppSelectorMock.mockReturnValue(agentsMockReturnedValues)
    })

    it('should pass query factories with three arguments and return empty data', () => {
        const {result} = renderHook(
            () => useCommentHighlights(statsFilters, timezone, queryScores),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            commentHighlightsQueryFactory(statsFilters, timezone, queryScores)
        )
        expect(result.current).toEqual({
            ...emptyMetricPerDimensionReturnValue,
            data: [],
        })
    })

    it('should call useQuerys with empty array and return empty data', () => {
        const {result} = renderHook(
            () => useCommentHighlights(statsFilters, timezone, queryScores),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(useQueriesMock).toHaveBeenCalledWith({queries: []})
        expect(result.current).toEqual({
            ...emptyMetricPerDimensionReturnValue,
            data: [],
        })
    })

    it('should not return finalData while loading customerQueries', () => {
        useMetricPerDimensionMock.mockReturnValue({
            data: {value: null, decile: 0, allData: allDataDummy},
            isFetching: false,
            isError: false,
        })
        useQueriesMock.mockReturnValue([
            {
                isLoading: true,
                isError: false,
                data: null,
            } as any,
        ])

        const {result} = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores)
        )

        expect(result.current).toEqual({
            isFetching: true,
            isError: false,
        })
    })

    it('should return fallback values when query does not return values', () => {
        const emptyAllDataDummy = [
            {
                [TicketDimension.TicketId]: '',
                [TicketDimension.AssigneeUserId]: '',
                [TicketSatisfactionSurveyDimension.SurveyCustomerId]: '',
                [TicketDimension.SurveyScore]: '',
                [TicketSatisfactionSurveyDimension.SurveyComment]: '',
            },
        ]
        useMetricPerDimensionMock.mockReturnValue({
            data: {value: null, decile: 0, allData: emptyAllDataDummy},
            isFetching: false,
            isError: false,
        })
        useQueriesMock.mockReturnValue([
            {
                isLoading: false,
                isError: false,
                data: null,
            } as any,
        ])

        const {result} = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores)
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: [
                {
                    assignee: null,
                    comment: null,
                    customerName: null,
                    surveyScore: null,
                    ticketId: null,
                    surveyCustomerId: null,
                },
            ],
        })
    })

    it('should return finalData with computed customerName when not loading and no error', () => {
        useMetricPerDimensionMock.mockReturnValue({
            data: {value: null, decile: 0, allData: allDataDummy},
            isFetching: false,
            isError: false,
        })
        useQueriesMock.mockReturnValue([
            {
                isLoading: false,
                isError: false,
                data: {
                    data: {name: 'Customer A'},
                },
            } as any,
        ])

        const {result} = renderHook(() =>
            useCommentHighlights(statsFilters, timezone, queryScores)
        )

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: [
                {
                    ticketId: '1',
                    surveyScore: '5',
                    comment: 'Great service',
                    assignee: {name: 'John Doe', url: 'http://image.url'},
                    customerName: 'Customer A',
                    surveyCustomerId: '10',
                },
            ],
        })
    })
})
