import {act as actHooks, renderHook} from '@testing-library/react-hooks'
import {act, waitFor} from '@testing-library/react'
import {AxiosRequestConfig, AxiosResponse} from 'axios'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Tag} from '@gorgias/api-queries'

import {ApiListResponseCursorPagination} from 'models/api/types'
import {
    TAGS_FETCH_ERROR_MESSAGE,
    useTagSearch,
} from 'hooks/reporting/common/useTagSearch'
import {fetchTags} from 'models/tag/resources'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

jest.mock('models/tag/resources')
const fetchTagsMock = assumeMock(fetchTags)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useTagSearch', () => {
    const defaultState = {
        entities: {
            tags: {},
        },
    } as RootState
    const sampleResponse = {
        data: {
            data: [],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
            object: '',
            uri: '',
        },
        status: 200,
        statusText: '',
        headers: {},
        config: {} as AxiosRequestConfig,
    } as AxiosResponse<ApiListResponseCursorPagination<Tag[], any>>

    beforeEach(() => {
        jest.useFakeTimers()
        fetchTagsMock.mockResolvedValue(sampleResponse)
    })

    it('should do nothing when no response', () => {
        fetchTagsMock.mockResolvedValue(undefined as any)

        const {result} = renderHook(() => useTagSearch(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        let searchResponse
        act(() => {
            searchResponse = result.current.handleTagsSearch('abc')
        })

        actHooks(() => {
            jest.runOnlyPendingTimers()
        })

        expect(searchResponse).toEqual(undefined)
    })

    it('should dispatch the error notification on failed request', async () => {
        const store = mockStore(defaultState)
        fetchTagsMock.mockRejectedValue(new Error('some error'))

        const {result} = renderHook(() => useTagSearch(), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        act(() => {
            result.current.handleTagsSearch('abc')
        })

        actHooks(() => {
            jest.runOnlyPendingTimers()
        })

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        message: TAGS_FETCH_ERROR_MESSAGE,
                    }),
                })
            )
        })
    })

    it('shouldLoadMore when next cursor and not fetching', async () => {
        const store = mockStore(defaultState)
        fetchTagsMock.mockResolvedValue({
            ...sampleResponse,
            data: {
                data: [],
                meta: {
                    next_cursor: 'someCursor',
                    prev_cursor: null,
                },
                object: '',
                uri: '',
            },
        })

        const {result} = renderHook(() => useTagSearch(), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        act(() => {
            result.current.handleTagsSearch('abc')
        })
        actHooks(() => {
            jest.runOnlyPendingTimers()
        })

        await waitFor(() => {
            expect(result.current.shouldLoadMore).toEqual(true)
        })
    })
})
