import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
} from 'domains/reporting/hooks/metricsPerCustomField'
import {
    useAIIntentCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountForProductTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
    useSentimentsCustomFieldsTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import {
    useAIIntentCustomFieldsTimeSeries,
    useCustomFieldsForProductTimeSeries,
    useCustomFieldsTimeSeries,
    useSentimentsCustomFieldsTimeSeries,
} from 'domains/reporting/hooks/useCustomFieldsTimeSeries'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    Sentiment,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

jest.mock('domains/reporting/hooks/timeSeries')
const useAIIntentCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useAIIntentCustomFieldsTicketCountTimeSeries,
)
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)
const useCustomFieldsTicketCountForProductTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountForProductTimeSeries,
)
const useSentimentsCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useSentimentsCustomFieldsTicketCountTimeSeries,
)
jest.mock('domains/reporting/hooks/metricsPerCustomField')
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

    describe('useAIIntentCustomFieldsTimeSeries', () => {
        beforeEach(() => {
            useAIIntentCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
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
        })

        it('should return AI intent custom fields trend', () => {
            const { result } = renderHook(
                () =>
                    useAIIntentCustomFieldsTimeSeries({
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
            useAIIntentCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
                data: undefined,
                isFetching: false,
            } as any)

            const { result } = renderHook(
                () =>
                    useAIIntentCustomFieldsTimeSeries({
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

        it('should call useAIIntentCustomFieldsTicketCountTimeSeries with correct parameters', () => {
            renderHook(
                () =>
                    useAIIntentCustomFieldsTimeSeries({
                        selectedCustomFieldId,
                        ticketFieldsTicketTimeReference,
                        topAmount: 5,
                        datasetVisibilityItems: 2,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(
                useAIIntentCustomFieldsTicketCountTimeSeriesMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    period: expect.anything(),
                }),
                'UTC',
                ReportingGranularity.Hour,
                selectedCustomFieldId,
                'desc',
            )
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
        const sentimentValueStrings = [Sentiment.Positive, Sentiment.Negative]

        it('should return formatted sentiment data', () => {
            useSentimentsCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
                data: {
                    [Sentiment.Positive]: [
                        [
                            { dateTime: '2023-04-07T10:00:00.000Z', value: 5 },
                            { dateTime: '2023-04-07T11:00:00.000Z', value: 10 },
                        ],
                    ],
                    [Sentiment.Negative]: [
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
                        label: Sentiment.Positive,
                        values: [
                            { x: '10:00 AM', y: 5 },
                            { x: '11:00 AM', y: 10 },
                        ],
                        isDisabled: false,
                    },
                    {
                        label: Sentiment.Negative,
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
