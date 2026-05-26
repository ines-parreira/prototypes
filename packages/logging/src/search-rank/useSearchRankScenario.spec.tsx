import { act, renderHook } from '@testing-library/react'

import { logEvent, SegmentEvent } from '../segment'
import type {
    SearchRankRequest,
    SearchRankResponse,
} from './useSearchRankScenario'
import {
    DATABASE_TYPE,
    EntityType,
    SearchEngine,
    SearchRankSource,
    useSearchRankScenario,
} from './useSearchRankScenario'

vi.mock('../segment')

describe('useSearchRankScenario', () => {
    const logEventMock = vi.mocked(logEvent)
    const defaultScenarioTimeout = 1000
    const searchEngine = SearchEngine.ES
    const defaultResultsRequest: SearchRankRequest = {
        query: 'foo',
        requestTime: 1000,
    }
    const defaultResultsResponse: SearchRankResponse = {
        numberOfResults: 3,
        responseTime: 1234,
        searchEngine,
    }

    beforeEach(() => {
        vi.useFakeTimers()
        vi.clearAllMocks()
        window.GORGIAS_STATE = {
            currentAccount: {
                domain: 'acme',
            },
        }
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    it('should log search success when user clicks the result', () => {
        const selectedResultObjectId = 'bar'
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
        act(() => vi.runAllTimers())

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

    it('should use a custom search query ranked event when provided', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
            }),
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
            SegmentEvent.SearchQueryRankedV2,
            expect.objectContaining({
                search_query: defaultResultsRequest.query,
                rank: -1,
            }),
        )
    })

    it('should set isRunning flag to true when scenario is running', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
        )

        expect(result.current.isRunning).toBe(false)

        act(() => {
            const { registerResultsRequest, registerResultsResponse } =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        expect(result.current.isRunning).toBe(true)

        act(() => vi.runAllTimers())
        expect(result.current.isRunning).toBe(false)
    })

    it('should log search failure immediately when results are empty', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
        )

        act(() => {
            const { registerResultsRequest, registerResultsResponse } =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        act(() => vi.runAllTimers())

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: -1,
            }),
        )
    })

    it('should log rank when second results request is registered', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
        const { result, unmount } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
            }),
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
