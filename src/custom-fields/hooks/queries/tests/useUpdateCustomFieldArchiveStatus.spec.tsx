import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { OBJECT_TYPES } from 'custom-fields/constants'
import {
    customFieldDefinitionKeys,
    useUpdatePartialCustomField,
} from 'custom-fields/hooks/queries/queries'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useUpdateCustomFieldArchiveStatus } from '../useUpdateCustomFieldArchiveStatus'

const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/queries')
const useUpdatePartialCustomFieldMock = assumeMock(useUpdatePartialCustomField)

const updateMutateMock = jest.fn()

const mockStore = configureMockStore([thunk])()

describe('useUpdateCustomFieldArchiveStatus', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
        useUpdatePartialCustomFieldMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
                mutateAsync: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdatePartialCustomField>
        })
        jest.useFakeTimers().setSystemTime(42)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should accept an id param and pass them to the mutation query with proper data structure', () => {
        const { result } = renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id,
                    ticketDropdownFieldDefinition.object_type,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        const expectedData = [
            ticketDropdownFieldDefinition.id,
            { deactivated_datetime: '1970-01-01T00:00:00.042Z' },
        ]

        result.current.mutate(true)
        expect(updateMutateMock).toHaveBeenNthCalledWith(1, expectedData)

        void result.current.mutateAsync(true)
        expect(updateMutateMock).toHaveBeenNthCalledWith(2, expectedData)
    })

    it.each([
        {
            objectType: OBJECT_TYPES.TICKET,
            deactivatedDatetime: '1970-01-01T00:00:00.042Z',
            message: `Ticket field has been successfully archived.`,
        },
        {
            objectType: OBJECT_TYPES.CUSTOMER,
            deactivatedDatetime: '1970-01-01T00:00:00.042Z',
            message: `Customer field has been successfully archived.`,
        },
        {
            objectType: OBJECT_TYPES.TICKET,
            deactivatedDatetime: null,
            message: `Ticket field has been successfully moved to active.`,
        },
        {
            objectType: OBJECT_TYPES.CUSTOMER,
            deactivatedDatetime: null,
            message: `Customer field has been successfully moved to active.`,
        },
    ])(
        'should dispatch success notification on success and invalidate proper query data',
        ({ objectType, deactivatedDatetime, message }) => {
            const invalidateQueryMock = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            }
            renderHook(
                () =>
                    useUpdateCustomFieldArchiveStatus(
                        fieldDefinition.id,
                        fieldDefinition.object_type,
                    ),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore}>{children}</Provider>
                        </QueryClientProvider>
                    ),
                },
            )

            useUpdatePartialCustomFieldMock.mock.calls[0][0]?.onSuccess!(
                axiosSuccessResponse(fieldDefinition),
                [
                    fieldDefinition.id,
                    { deactivated_datetime: deactivatedDatetime },
                ],
                undefined,
            )
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: customFieldDefinitionKeys.all(),
            })

            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        },
    )

    it('should dispatch failure notification on error', () => {
        renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id,
                    ticketDropdownFieldDefinition.object_type,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        useUpdatePartialCustomFieldMock.mock.calls[0][0]?.onError!(
            {},
            [ticketDropdownFieldDefinition.id, { deactivated_datetime: '42' }],
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
