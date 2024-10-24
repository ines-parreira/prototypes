import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useUpdateCustomFields,
    customFieldDefinitionKeys,
    UseGetCustomFieldDefinitions,
} from 'custom-fields/hooks/queries/queries'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {useUpdateCustomFieldDefinitions} from '../useUpdateCustomFieldDefinitions'

const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/queries')
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

    const listParams = {archived: false, object_type: 'Ticket'} as const

    it('should cancel previous query on update', () => {
        const cancelQueryMock = jest.spyOn(queryClient, 'cancelQueries')
        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldsMock.mock.calls[0][0]?.onMutate!([
            [ticketDropdownFieldDefinition],
        ])

        expect(cancelQueryMock).toHaveBeenLastCalledWith({
            queryKey: customFieldDefinitionKeys.list(listParams),
        })
    })

    it('should optimistically update query on update and sort fields if priority changed', async () => {
        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            {...ticketDropdownFieldDefinition, id: 420, priority: 1},
            {...ticketDropdownFieldDefinition, id: 421, priority: 2},
            {...ticketDropdownFieldDefinition, id: 422, priority: 3},
        ])
        const setQueryDataMock = jest.spyOn(queryClient, 'setQueryData')
        setQueryDataMock.mockImplementation((queryKey, spiedCallback) => {
            if (typeof spiedCallback === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return spiedCallback(
                    axiosSuccessResponse(ticketDropdownFieldDefinitions)
                )
            }
        })

        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })
        useUpdateCustomFieldsMock.mock.calls[0][0]?.onMutate!([
            [
                {id: 422, priority: 1},
                {id: 420, priority: 2},
                {id: 421, priority: 3},
            ],
        ])
        await waitFor(() => expect(setQueryDataMock).toHaveBeenCalledTimes(1))
        expect(setQueryDataMock.mock.calls[0][0]).toEqual(
            customFieldDefinitionKeys.list(listParams)
        )
        const results: UseGetCustomFieldDefinitions =
            setQueryDataMock.mock.results[0].value
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
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldsMock.mock.calls[0][0]?.onSettled!(
            undefined,
            {},
            [[ticketDropdownFieldDefinition]],
            undefined
        )
        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: customFieldDefinitionKeys.list(listParams),
        })
    })

    it('should dispatch failure notification on error', () => {
        renderHook(() => useUpdateCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldsMock.mock.calls[0][0]?.onError!(
            {},
            [[ticketDropdownFieldDefinition]],
            undefined
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
