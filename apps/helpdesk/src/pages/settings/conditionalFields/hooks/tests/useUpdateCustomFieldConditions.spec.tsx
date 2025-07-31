import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    ListCustomFieldConditionsResult,
    queryKeys,
    useUpdateCustomFieldConditions as useBulkUpdate,
} from '@gorgias/helpdesk-queries'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import useUpdateCustomFieldConditions from '../useUpdateCustomFieldConditions'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useUpdateCustomFieldConditionsMock = assumeMock(useBulkUpdate)

const mockStore = configureMockStore([thunk])()

describe('useUpdateCustomFieldConditions', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('should optimistically update query on update and sort fields if sort order changed', async () => {
        // Set the initial data that should be optimistically updated
        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            { ...customFieldCondition, id: 1000, sort_order: 1 },
            { ...customFieldCondition, id: 1001, sort_order: 2 },
            { ...customFieldCondition, id: 1002, sort_order: 3 },
        ])
        const setQueryDataMock = jest.spyOn(queryClient, 'setQueryData')
        setQueryDataMock.mockImplementation((queryKey, spiedCallback) => {
            if (typeof spiedCallback === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return spiedCallback(
                    axiosSuccessResponse(ticketDropdownFieldDefinitions),
                )
            }
        })

        // Call the mutation endpoint
        renderHook(() => useUpdateCustomFieldConditions(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })
        useUpdateCustomFieldConditionsMock.mock.calls[0][0]?.mutation!
            .onMutate!({
            data: [
                { id: 1000, sort_order: 2 },
                { id: 1001, sort_order: 3 },
                { id: 1002, sort_order: 1 },
            ],
        })
        await waitFor(() => expect(setQueryDataMock).toHaveBeenCalledTimes(1))
        expect(setQueryDataMock.mock.calls[0][0]).toEqual(
            queryKeys.customFieldConditions.listCustomFieldConditions(),
        )

        // The new data should match the one passed to the endpoint, sorted by sort_order
        const results: ListCustomFieldConditionsResult =
            setQueryDataMock.mock.results[0].value
        expect(
            results.data.data.map(({ id, sort_order }) => ({ id, sort_order })),
        ).toEqual([
            { id: 1002, sort_order: 1 },
            { id: 1000, sort_order: 2 },
            { id: 1001, sort_order: 3 },
        ])
    })

    it('should invalidate proper query data on settled', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useUpdateCustomFieldConditions(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldConditionsMock.mock.calls[0][0]?.mutation!
            .onSettled!(
            axiosSuccessResponse([customFieldCondition]) as any,
            null,
            { data: [customFieldCondition] },
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey:
                queryKeys.customFieldConditions.listCustomFieldConditions(),
        })
    })
})
