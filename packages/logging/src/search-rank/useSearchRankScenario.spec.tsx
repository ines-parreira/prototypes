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
                user_id: 1,
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
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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

    it('should not log search rank events by default', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile),
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

        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('should set isRunning flag to true when scenario is running', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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
    })

    it('should log search failure if no result selection is registered within the timeout', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
            }),
        )

        act(() => {
            const { registerResultsRequest, registerResultsResponse } =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        act(() => vi.runAllTimers())
    })

    it('should log rank when second results request is registered', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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
    })

    it('should log rank on unmount', () => {
        const { result, unmount } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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
    })

    it('should log rank on endScenario call', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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
    })

    it(`should log ${
        DATABASE_TYPE[SearchEngine.PG]
    } database type by default`, () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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
    })

    it('should log rank once when two requests are registered', () => {
        const { result } = renderHook(() =>
            useSearchRankScenario(SearchRankSource.CustomerProfile, {
                scenarioTimeout: defaultScenarioTimeout,
                searchQueryRankedEvent: SegmentEvent.SearchQueryRankedV2,
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
    })
})
