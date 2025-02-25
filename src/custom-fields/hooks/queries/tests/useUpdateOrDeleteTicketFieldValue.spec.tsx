import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    customFieldValueKeys,
    useDeleteCustomFieldValue,
    useUpdateCustomFieldValue,
} from 'custom-fields/hooks/queries/queries'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useUpdateOrDeleteTicketFieldValue } from '../useUpdateOrDeleteTicketFieldValue'

const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/queries')
const useUpdateCustomFieldValueMock = assumeMock(useUpdateCustomFieldValue)
const useDeleteCustomFieldValueMock = assumeMock(useDeleteCustomFieldValue)

const updateMutateMock = jest.fn()
const deleteMutateMock = jest.fn()

const mockStore = configureMockStore([thunk])()

describe('useUpdateOrDeleteTicketFieldValue', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useUpdateCustomFieldValueMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdateCustomFieldValue>
        })

        useDeleteCustomFieldValueMock.mockImplementation(() => {
            return {
                mutate: deleteMutateMock,
            } as unknown as ReturnType<typeof useDeleteCustomFieldValue>
        })
    })

    const dataToMutate = {
        fieldType: 'Ticket' as const,
        holderId: 1,
        fieldId: 1,
    }

    it('should not do any mutation if disabled', () => {
        const { result } = renderHook(
            () =>
                useUpdateOrDeleteTicketFieldValue(undefined, {
                    isDisabled: true,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        result.current.mutate([dataToMutate])

        expect(updateMutateMock).not.toHaveBeenCalled()
        expect(deleteMutateMock).not.toHaveBeenCalled()
    })

    it('should call the correct mutation with passed params according to the existence of a value', () => {
        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        result.current.mutate([dataToMutate])
        expect(updateMutateMock).not.toHaveBeenCalled()
        expect(deleteMutateMock).toHaveBeenNthCalledWith(1, [dataToMutate])

        updateMutateMock.mockClear()
        deleteMutateMock.mockClear()

        const dataToMutateWithValue = { ...dataToMutate, value: 'foo' }
        result.current.mutate([dataToMutateWithValue])
        expect(updateMutateMock).toHaveBeenNthCalledWith(1, [
            dataToMutateWithValue,
        ])
        expect(deleteMutateMock).not.toHaveBeenCalled()
    })

    it('should accept overrides as first param and pass them to the mutation query', () => {
        const cacheTime = 101
        renderHook(
            () =>
                useUpdateOrDeleteTicketFieldValue(
                    { cacheTime },
                    { isDisabled: true },
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )
        expect(useUpdateCustomFieldValueMock.mock.calls[0][0]?.cacheTime).toBe(
            cacheTime,
        )
    })

    it('should invalidate proper query data on success if not provided with another success handler', () => {
        const onSuccess = jest.fn()
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        const { rerender } = renderHook<
            { onSuccess?: jest.Mock },
            ReturnType<typeof useUpdateOrDeleteTicketFieldValue>
        >((props) => useUpdateOrDeleteTicketFieldValue(props, {}), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
            initialProps: { onSuccess },
        })

        expect(useUpdateCustomFieldValueMock.mock.calls[0][0]?.onSuccess).toBe(
            onSuccess,
        )
        expect(invalidateQueryMock).not.toHaveBeenCalled()
        // we can’t only provide undefined here because it would then keep the old params 🤷
        rerender({})
        useUpdateCustomFieldValueMock.mock.calls[1][0]?.onSuccess!(
            axiosSuccessResponse({
                field: ticketDropdownFieldDefinition,
                value: undefined,
                prediction: null,
            }),
            [dataToMutate],
            undefined,
        )
        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: customFieldValueKeys.value(dataToMutate.fieldId),
        })
    })

    it.each([true, false])(
        'should provide a onError param that calls the notify action even if an onError param is provided (%s)',
        (useResponseError) => {
            mockStore.clearActions()

            const onError = jest.fn()
            renderHook(() => useUpdateOrDeleteTicketFieldValue({ onError }), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            useDeleteCustomFieldValueMock.mock.calls[0][0]?.onError!(
                useResponseError
                    ? {
                          isAxiosError: true,
                          response: {
                              status: 403,
                              data: { error: { msg: 'Unauthorized' } },
                          },
                      }
                    : {
                          error: new Error('foo'),
                          message: 'fooloulou',
                      },
                [dataToMutate],
                undefined,
            )

            expect(onError).toHaveBeenCalled()
            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        status: NotificationStatus.Error,
                        message: useResponseError
                            ? 'Unauthorized'
                            : 'Failed to update ticket field value. Please try again in a few seconds.',
                    },
                },
            ])
        },
    )
    it('should update the prediction value when the value is mutated', () => {
        useUpdateCustomFieldValueMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
                data: axiosSuccessResponse({
                    field: ticketDropdownFieldDefinition,
                    value: undefined,
                    prediction: {
                        predicted: 'Subscription::Cancel',
                        confidence: 80,
                        display: true,
                        confirmed: false,
                        modified: false,
                    },
                }),
            } as unknown as ReturnType<typeof useUpdateCustomFieldValue>
        })

        renderHook(() => useUpdateOrDeleteTicketFieldValue(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        expect(mockStore.getActions()[1]).toMatchSnapshot()
    })
})
