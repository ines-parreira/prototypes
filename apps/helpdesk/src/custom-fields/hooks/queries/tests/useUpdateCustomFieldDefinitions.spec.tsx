import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { UpdateCustomFieldItem } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateCustomFields } from '@gorgias/helpdesk-queries'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateCustomFieldDefinitions } from '../useUpdateCustomFieldDefinitions'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useUpdateCustomFieldsMock = assumeMock(useUpdateCustomFields)

const updateMutateMock = jest.fn()

const mockStore = configureMockStore([thunk])()

describe('useUpdateCustomFieldDefinitions', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
        useUpdateCustomFieldsMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdateCustomFields>
        })
    })

    const listParams = { archived: false, object_type: 'Ticket' } as const

    it('should cancel previous query on update', () => {
        const cancelQueryMock = jest.spyOn(queryClient, 'cancelQueries')
        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldsMock.mock.calls[0][0]?.mutation?.onMutate!({
            data: [ticketDropdownFieldDefinition as UpdateCustomFieldItem],
        })

        expect(cancelQueryMock).toHaveBeenLastCalledWith({
            queryKey: queryKeys.customFields.listCustomFields(listParams),
        })
    })

    it('should optimistically update query on update and sort fields if priority changed', async () => {
        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            { ...ticketDropdownFieldDefinition, id: 420, priority: 1 },
            { ...ticketDropdownFieldDefinition, id: 421, priority: 2 },
            { ...ticketDropdownFieldDefinition, id: 422, priority: 3 },
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

        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })
        useUpdateCustomFieldsMock.mock.calls[0][0]?.mutation?.onMutate!({
            data: [
                { id: 422, priority: 1 },
                { id: 420, priority: 2 },
                { id: 421, priority: 3 },
            ],
        })
        await waitFor(() => expect(setQueryDataMock).toHaveBeenCalledTimes(1))
        expect(setQueryDataMock.mock.calls[0][0]).toEqual(
            queryKeys.customFields.listCustomFields(listParams),
        )
        const results = setQueryDataMock.mock.results[0].value
        const data = results.data.data

        expect([
            [data[0].id, data[0].priority],
            [data[1].id, data[1].priority],
            [data[2].id, data[2].priority],
        ]).toEqual([
            [421, 3],
            [420, 2],
            [422, 1],
        ])
    })

    it('should invalidate proper query on settled', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldsMock.mock.calls[0][0]?.mutation?.onSettled!(
            undefined,
            {},
            { data: [ticketDropdownFieldDefinition as UpdateCustomFieldItem] },
            undefined,
        )
        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: queryKeys.customFields.listCustomFields(listParams),
        })
    })

    it('should dispatch failure notification on error', () => {
        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldsMock.mock.calls[0][0]?.mutation?.onError!(
            {},
            { data: [ticketDropdownFieldDefinition as UpdateCustomFieldItem] },
            undefined,
        )

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                },
            },
        ])
    })
})
