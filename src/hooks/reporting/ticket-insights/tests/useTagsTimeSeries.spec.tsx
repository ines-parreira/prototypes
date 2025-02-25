import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useTagsTicketCount } from 'hooks/reporting/metricsPerPeriod'
import { useTagsTimeSeries } from 'hooks/reporting/ticket-insights/useTagsTimeSeries'
import { useTagsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import { ReportingGranularity } from 'models/reporting/types'
import { TagsState } from 'state/entities/tags/types'
import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { ticketInsightsSlice } from 'state/ui/stats/ticketInsightsSlice'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/timeSeries')
const useTagsTicketCountTimeSeriesMock = assumeMock(
    useTagsTicketCountTimeSeries,
)
jest.mock('hooks/reporting/metricsPerPeriod')
const useTagsTicketCountMock = assumeMock(useTagsTicketCount)

describe('useTagsTimeSeries', () => {
    const fakeTagName = 'fake-tag-name'
    const anotherTagName = 'fake-tag-name'
    const tagId = 1010
    const anotherTagId = 1011
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                [ticketInsightsSlice.name]: {
                    selectedCustomField: { id: 2 },
                },
                filters: uiStatsInitialState,
            },
        },
        entities: {
            tags: {
                [tagId]: {
                    created_datetime: '2022-01-01T12:00:00.000000+00:00',
                    decoration: {
                        color: '#FF0000',
                    },
                    deleted_datetime: null,
                    description: 'This is a fake tag',
                    id: tagId,
                    name: fakeTagName,
                    uri: '/api/tags/123/',
                    usage: 80,
                },
                [anotherTagId]: {
                    created_datetime: '2022-01-01T12:00:00.000000+00:00',
                    decoration: {
                        color: '#FF0000',
                    },
                    deleted_datetime: null,
                    description: 'This is a fake tag',
                    id: anotherTagId,
                    name: anotherTagName,
                    uri: '/api/tags/123/',
                    usage: 80,
                },
            } as TagsState,
        },
    } as RootState

    useTagsTicketCountTimeSeriesMock.mockReturnValue({
        data: {
            [tagId]: [
                [
                    { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                    { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                    { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                ],
            ],
            [anotherTagId]: [
                [
                    { dateTime: '2023-04-07T00:00:00.000', value: 11 },
                    { dateTime: '2023-04-08T00:00:00.000', value: 16 },
                    { dateTime: '2023-04-09T00:00:00.000', value: 21 },
                ],
            ],
        },
        isFetching: false,
    } as any)

    useTagsTicketCountMock.mockReturnValue({
        data: {
            value: [
                {
                    [TicketTagsEnrichedDimension.TagId]: String(anotherTagId),
                    [TicketTagsEnrichedMeasure.TicketCount]: '35',
                },
                {
                    [TicketTagsEnrichedDimension.TagId]: String(tagId),
                    [TicketTagsEnrichedMeasure.TicketCount]: '45',
                },
            ],
            prevValue: [
                {
                    [TicketTagsEnrichedDimension.TagId]: String(tagId),
                    [TicketTagsEnrichedMeasure.TicketCount]: '25',
                },
                {
                    [TicketTagsEnrichedDimension.TagId]: String(anotherTagId),
                    [TicketTagsEnrichedMeasure.TicketCount]: '15',
                },
            ],
        },
        isError: false,
        isFetching: false,
    })

    it('should return tags trend', () => {
        const { result } = renderHook(() => useTagsTimeSeries(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            data: [
                [
                    { dateTime: '2023-04-07T00:00:00.000', value: 11 },
                    { dateTime: '2023-04-08T00:00:00.000', value: 16 },
                    { dateTime: '2023-04-09T00:00:00.000', value: 21 },
                ],
                [
                    { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                    { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                    { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                ],
            ],
            granularity: ReportingGranularity.Hour,
            legendInfo: {
                labels: [fakeTagName, anotherTagName],
                tooltips: [fakeTagName, anotherTagName],
            },
            legendDatasetVisibility: { 0: true, 1: true },
        })
    })

    it('should return sorted tags trend with tag id instead of name', () => {
        const tagId = '1010'
        const state = {
            ...defaultState,
            entities: {
                tags: {
                    '1616': {
                        created_datetime: '2022-01-01T12:00:00.000000+00:00',
                        decoration: {
                            color: '#FF0000',
                        },
                        deleted_datetime: null,
                        description: 'This is a fake tag',
                        id: 1616,
                        name: fakeTagName,
                        uri: '/api/tags/123/',
                        usage: 80,
                    },
                },
            },
        } as unknown as RootState

        const { result } = renderHook(() => useTagsTimeSeries(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            data: [
                [
                    { dateTime: '2023-04-07T00:00:00.000', value: 11 },
                    { dateTime: '2023-04-08T00:00:00.000', value: 16 },
                    { dateTime: '2023-04-09T00:00:00.000', value: 21 },
                ],
                [
                    { dateTime: '2023-04-07T00:00:00.000', value: 10 },
                    { dateTime: '2023-04-08T00:00:00.000', value: 15 },
                    { dateTime: '2023-04-09T00:00:00.000', value: 20 },
                ],
            ],
            granularity: ReportingGranularity.Hour,
            legendInfo: {
                labels: [String(anotherTagId), tagId],
                tooltips: [String(anotherTagId), tagId],
            },
            legendDatasetVisibility: { 0: true, 1: true },
        })
    })

    it('should return no data if no time series were returned', () => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const { result } = renderHook(() => useTagsTimeSeries(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

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
