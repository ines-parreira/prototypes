import React, { ComponentType } from 'react'

import { act } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { logEvent, SegmentEvent } from 'common/segment'
import { account } from 'fixtures/account'
import useSearchRankScenario, {
    DATABASE_TYPE,
    EntityType,
    SearchRankRequest,
    SearchRankResponse,
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import { SearchEngine } from 'models/search/types'
import { RootState, StoreDispatch } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore<RootState, StoreDispatch>()
jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('useSearchRankScenario', () => {
    const defaultScenarioTimeout = 1000
    const searchEngine = SearchEngine.ES
    const defaultResultsRequest: SearchRankRequest = {
        query: 'foo',
        requestTime: 1000,
    }
    const defaultResultsResponse: SearchRankResponse = {
        numberOfResults: 3,
        responseTime: 1234,
        searchEngine: searchEngine,
    }
    const defaultState = {
        currentAccount: fromJS(account),
    } as RootState

    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should log search success when user clicks the result', () => {
        const selectedResultObjectId = 'bar'
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const {
                registerResultSelection,
                registerResultsRequest,
                registerResultsResponse,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({
                index: 1,
                id: 'foo',
                type: EntityType.Customer,
            })
            registerResultSelection({
                index: 2,
                id: selectedResultObjectId,
                type: EntityType.Customer,
            })
        })
        act(() => jest.runAllTimers())

        expect(logEventMock.mock.calls).toEqual([
            [
                SegmentEvent.SearchQueryRanked,
                {
                    account_domain: 'acme',
                    database_type: DATABASE_TYPE[searchEngine],
                    datetime: '1970-01-01T00:00:01.000Z',
                    number_of_results: 3,
                    query_source: 'customer_profile',
                    rank: 3,
                    response_time:
                        defaultResultsResponse.responseTime -
                        defaultResultsRequest.requestTime,
                    result_object_id: selectedResultObjectId,
                    search_query: defaultResultsRequest.query,
                },
            ],
        ])
    })

    it('should set isRunning flag to true when scenario is running', () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        expect(result.current.isRunning).toBe(false)

        act(() => {
            const { registerResultsRequest, registerResultsResponse } =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        expect(result.current.isRunning).toBe(true)

        act(() => jest.runAllTimers())
        expect(result.current.isRunning).toBe(false)
    })

    it('should log search failure immediately when results are empty', () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const { registerResultsRequest, registerResultsResponse } =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse({
                ...defaultResultsResponse,
                numberOfResults: 0,
            })
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: -1,
            }),
        )
    })

    it('should log search failure if no result selection is registered within the timeout', () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const { registerResultsRequest, registerResultsResponse } =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        act(() => jest.runAllTimers())

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: -1,
            }),
        )
    })

    it('should log rank when second results request is registered', () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({
                index: 1,
                id: 'bar',
                type: EntityType.Customer,
            })
            registerResultsRequest({
                query: 'foobar',
                requestTime: 2000,
            })
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                search_query: 'foo',
                rank: 2,
            }),
        )
    })

    it('should log rank on unmount', () => {
        const { result, unmount } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({
                index: 1,
                id: 'foo',
                type: EntityType.Customer,
            })
        })
        unmount()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: 2,
            }),
        )
    })

    it('should log rank on endScenario call', () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
                endScenario,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({
                index: 1,
                id: 'foo',
                type: EntityType.Customer,
            })
            endScenario()
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: 2,
            }),
        )
    })

    it(`should log ${
        DATABASE_TYPE[SearchEngine.PG]
    } database type by default`, () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
                endScenario,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse({
                ...defaultResultsResponse,
                searchEngine: undefined,
            })
            registerResultSelection({
                index: 1,
                id: 'foo',
                type: EntityType.Customer,
            })
            endScenario()
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                database_type: DATABASE_TYPE[SearchEngine.PG],
            }),
        )
    })

    it('should log rank once when two requests are registered', () => {
        const { result } = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout,
                ),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
                endScenario,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({
                index: 1,
                id: 'foo',
                type: EntityType.Customer,
            })
            endScenario()
        })

        expect(logEventMock.mock.calls).toEqual([
            [
                SegmentEvent.SearchQueryRanked,
                {
                    account_domain: 'acme',
                    database_type: DATABASE_TYPE[searchEngine],
                    datetime: '1970-01-01T00:00:01.000Z',
                    number_of_results: defaultResultsResponse.numberOfResults,
                    query_source: 'customer_profile',
                    rank: 2,
                    response_time:
                        defaultResultsResponse.responseTime -
                        defaultResultsRequest.requestTime,
                    result_object_id: defaultResultsRequest.query,
                    search_query: defaultResultsRequest.query,
                },
            ],
        ])
    })
})
