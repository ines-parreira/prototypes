import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
} from 'hooks/reporting/metricsPerCustomField'
import {
    useCustomFieldsTicketCountForProductTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useSentimentsCustomFieldsTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import { Sentiments } from 'hooks/reporting/types'
import {
    useCustomFieldsForProductTimeSeries,
    useCustomFieldsTimeSeries,
    useSentimentsCustomFieldsTimeSeries,
} from 'hooks/reporting/useCustomFieldsTimeSeries'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { ReportingGranularity } from 'models/reporting/types'
import { TicketTimeReference } from 'models/stat/types'
import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)
const useCustomFieldsTicketCountForProductTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountForProductTimeSeries,
)
const useSentimentsCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useSentimentsCustomFieldsTicketCountTimeSeries,
)
jest.mock('hooks/reporting/metricsPerCustomField')
const useCustomFieldsTicketCountMock = assumeMock(useCustomFieldsTicketCount)
const useCustomFieldsForProductTicketCountMock = assumeMock(
    useCustomFieldsForProductTicketCount,
)

describe('useCustomFieldsTimeSeries', () => {
    const selectedCustomFieldId = 2
    const ticketFieldsTicketTimeReference = TicketTimeReference.CreatedAt
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                filters: uiStatsInitialState,
            },
        },
    } as RootState

    beforeEach(() => {
        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            data: {
                'Category::Subcategory': [
                    [
                        { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                        { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                        { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                    ],
                ],
            },
            isFetching: false,
        } as any)

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Category::Subcategory',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                            '45',
                    },
                ],
                value: 45,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        jest.clearAllMocks()
    })

    describe('useCustomFieldsTicketCountTimeSeries', () => {
        it('should return custom fields trend', () => {
            const { result } = renderHook(
                () =>
                    useCustomFieldsTimeSeries({
                        selectedCustomFieldId,
                        ticketFieldsTicketTimeReference,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    [
                        { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                        { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                        { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                    ],
                ],
                granularity: ReportingGranularity.Hour,
                legendInfo: {
                    labels: ['Subcategory'],
                    tooltips: ['Category > Subcategory'],
                },
                legendDatasetVisibility: { 0: true },
            })
        })

        it('should return empty when no data', () => {
            useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
                data: undefined,
                isFetching: false,
            } as any)

            const { result } = renderHook(
                () =>
                    useCustomFieldsTimeSeries({
                        selectedCustomFieldId,
                        ticketFieldsTicketTimeReference,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                data: [],
                granularity: ReportingGranularity.Hour,
                legendInfo: {
                    labels: [],
                    tooltips: [],
                },
                legendDatasetVisibility: {},
            })
        })
    })

    describe('useCustomFieldsForProductTicketCountTimeSeries', () => {
        const productId = '123'

        beforeEach(() => {
            useCustomFieldsTicketCountForProductTimeSeriesMock.mockReturnValue({
                data: {
                    'Category::Subcategory': [
                        [
                            { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                            { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                            { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                        ],
                    ],
                },
                isFetching: false,
            } as any)
            useCustomFieldsForProductTicketCountMock.mockReturnValue({
                data: {
                    allData: [
                        {
                            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                                'Category::Subcategory',
                            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                                '45',
                        },
                    ],
                    value: 45,
                    decile: null,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return custom fields trend', () => {
            const { result } = renderHook(
                () =>
                    useCustomFieldsForProductTimeSeries({
                        selectedCustomFieldId,
                        productId,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    [
                        { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                        { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                        { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                    ],
                ],
                granularity: ReportingGranularity.Hour,
                legendInfo: {
                    labels: ['Subcategory'],
                    tooltips: ['Category > Subcategory'],
                },
                legendDatasetVisibility: { 0: true },
            })
        })

        it('should return empty when no data', () => {
            useCustomFieldsTicketCountForProductTimeSeriesMock.mockReturnValue({
                data: undefined,
                isFetching: false,
            } as any)

            const { result } = renderHook(
                () =>
                    useCustomFieldsForProductTimeSeries({
                        selectedCustomFieldId,
                        productId,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                data: [],
                granularity: ReportingGranularity.Hour,
                legendInfo: {
                    labels: [],
                    tooltips: [],
                },
                legendDatasetVisibility: {},
            })
        })
    })

    describe('useSentimentsCustomFieldsTimeSeries', () => {
        const sentimentCustomFieldId = 123
        const sentimentValueStrings = [Sentiments.Positive, Sentiments.Negative]

        it('should return formatted sentiment data', () => {
            useSentimentsCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
                data: {
                    [Sentiments.Positive]: [
                        [
                            { dateTime: '2023-04-07T10:00:00.000Z', value: 5 },
                            { dateTime: '2023-04-07T11:00:00.000Z', value: 10 },
                        ],
                    ],
                    [Sentiments.Negative]: [
                        [
                            { dateTime: '2023-04-07T10:00:00.000Z', value: 3 },
                            { dateTime: '2023-04-07T11:00:00.000Z', value: 7 },
                        ],
                    ],
                },
                isFetching: false,
                isError: false,
            } as any)

            const { result } = renderHook(
                () =>
                    useSentimentsCustomFieldsTimeSeries({
                        sentimentCustomFieldId,
                        sentimentValueStrings,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: [
                    {
                        label: Sentiments.Positive,
                        values: [
                            { x: '10:00 AM', y: 5 },
                            { x: '11:00 AM', y: 10 },
                        ],
                        isDisabled: false,
                    },
                    {
                        label: Sentiments.Negative,
                        values: [
                            { x: '10:00 AM', y: 3 },
                            { x: '11:00 AM', y: 7 },
                        ],
                        isDisabled: false,
                    },
                ],
            })
        })

        it('should handle loading and error states', () => {
            useSentimentsCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
                data: undefined,
                isFetching: true,
                isError: true,
            } as any)

            const { result } = renderHook(
                () =>
                    useSentimentsCustomFieldsTimeSeries({
                        sentimentCustomFieldId,
                        sentimentValueStrings,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: true,
                isError: true,
                data: [],
            })
        })
    })
})
