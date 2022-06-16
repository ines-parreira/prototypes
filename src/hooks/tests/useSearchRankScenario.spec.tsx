import {act, renderHook} from 'react-hooks-testing-library'
import React, {ComponentType} from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useSearchRankScenario, {
    SearchRankRequest,
    SearchRankResponse,
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {SearchEngine} from 'models/search/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

const mockStore = configureMockStore<RootState, StoreDispatch>()
jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('useSearchRankScenario', () => {
    const defaultScenarioTimeout = 1000
    const defaultResultsRequest: SearchRankRequest = {
        query: 'foo',
        requestTime: 1000,
    }
    const defaultResultsResponse: SearchRankResponse = {
        numberOfResults: 3,
        responseTime: 1234,
        searchEngine: SearchEngine.ES,
    }
    const defaultState = {
        currentAccount: fromJS(account),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should log search success when user clicks the result', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        act(() => {
            const {
                registerResultSelection,
                registerResultsRequest,
                registerResultsResponse,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({index: 1, id: 'foo'})
            registerResultSelection({index: 2, id: 'bar'})
        })
        act(() => jest.runAllTimers())

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })

    it('should set isRunning flag to true when scenario is running', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        expect(result.current.isRunning).toBe(false)

        act(() => {
            const {registerResultsRequest, registerResultsResponse} =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        expect(result.current.isRunning).toBe(true)

        act(() => jest.runAllTimers())
        expect(result.current.isRunning).toBe(false)
    })

    it('should log search failure immediately when results are empty', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        act(() => {
            const {registerResultsRequest, registerResultsResponse} =
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
            })
        )
    })

    it('should log search failure if no result selection is registered within the timeout', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        act(() => {
            const {registerResultsRequest, registerResultsResponse} =
                result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
        })
        act(() => jest.runAllTimers())

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: -1,
            })
        )
    })

    it('should log rank when second results request is registered', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({index: 1, id: 'bar'})
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
            })
        )
    })

    it('should log rank on unmount', () => {
        const {result, unmount} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        act(() => {
            const {
                registerResultsRequest,
                registerResultsResponse,
                registerResultSelection,
            } = result.current
            registerResultsRequest(defaultResultsRequest)
            registerResultsResponse(defaultResultsResponse)
            registerResultSelection({index: 1, id: 'foo'})
        })
        unmount()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: 2,
            })
        )
    })

    it('should log rank on endScenario call', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
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
            registerResultSelection({index: 1, id: 'foo'})
            endScenario()
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                rank: 2,
            })
        )
    })

    it('should log PG database type by default', () => {
        const {result} = renderHook(
            () =>
                useSearchRankScenario(
                    SearchRankSource.CustomerProfile,
                    defaultScenarioTimeout
                ),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
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
            registerResultSelection({index: 1, id: 'foo'})
            endScenario()
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SearchQueryRanked,
            expect.objectContaining({
                database_type: SearchEngine.PG,
            })
        )
    })
})
