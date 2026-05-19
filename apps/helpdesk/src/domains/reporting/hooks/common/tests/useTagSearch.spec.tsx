import { assumeMock, renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Tag } from '@gorgias/helpdesk-queries'

import {
    TAGS_FETCH_ERROR_MESSAGE,
    useTagSearch,
} from 'domains/reporting/hooks/common/useTagSearch'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import { fetchTags } from 'models/tag/resources'
import type { RootState, StoreDispatch } from 'state/types'

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
        fetchTagsMock.mockResolvedValue(sampleResponse)
    })

    it('should do nothing when no response', () => {
        jest.useFakeTimers()
        fetchTagsMock.mockResolvedValue(undefined as any)

        const { result } = renderHook(() => useTagSearch(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        let searchResponse
        act(() => {
            searchResponse = result.current.handleTagsSearch('abc')
        })

        act(() => {
            jest.runOnlyPendingTimers()
        })

        expect(searchResponse).toEqual(undefined)
        jest.useRealTimers()
    })

    it('should show an error toast on failed request', async () => {
        const store = mockStore(defaultState)
        fetchTagsMock.mockRejectedValue(new Error('some error'))

        const { result } = renderHook(() => useTagSearch(), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        act(() => {
            result.current.handleTagsSearch('abc')
        })

        const toastEl = await screen.findByRole('status', {
            name: TAGS_FETCH_ERROR_MESSAGE,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
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
                    total_resources: null,
                },
                object: '',
                uri: '',
            },
        })

        const { result } = renderHook(() => useTagSearch(), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        act(() => {
            result.current.handleTagsSearch('abc')
        })

        await waitFor(() => {
            expect(result.current.shouldLoadMore).toEqual(true)
        })
    })
})
