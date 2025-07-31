import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    queryKeys,
    TicketCustomFieldValueField,
    useDeleteTicketCustomField,
    useUpdateTicketCustomField,
} from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useUpdateOrDeleteTicketFieldValue } from '../useUpdateOrDeleteTicketFieldValue'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useUpdateTicketCustomFieldMock = assumeMock(useUpdateTicketCustomField)
const useDeleteTicketCustomFieldMock = assumeMock(useDeleteTicketCustomField)

const updateMutateMock = jest.fn()
const deleteMutateMock = jest.fn()

const mockStore = configureMockStore([thunk])()

describe('useUpdateOrDeleteTicketFieldValue', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useUpdateTicketCustomFieldMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdateTicketCustomField>
        })

        useDeleteTicketCustomFieldMock.mockImplementation(() => {
            return {
                mutate: deleteMutateMock,
            } as unknown as ReturnType<typeof useDeleteTicketCustomField>
        })
    })

    const dataToMutate = {
        ticketId: 1,
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

        result.current.mutate(dataToMutate)

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

        result.current.mutate(dataToMutate)
        expect(updateMutateMock).not.toHaveBeenCalled()
        expect(deleteMutateMock).toHaveBeenNthCalledWith(1, {
            id: dataToMutate.fieldId,
            ticketId: dataToMutate.ticketId,
        })

        updateMutateMock.mockClear()
        deleteMutateMock.mockClear()

        const dataToMutateWithValue = { ...dataToMutate, value: 'foo' }
        result.current.mutate(dataToMutateWithValue)
        expect(updateMutateMock).toHaveBeenNthCalledWith(1, {
            id: dataToMutateWithValue.fieldId,
            ticketId: dataToMutateWithValue.ticketId,
            data: JSON.stringify(dataToMutateWithValue.value),
        })
        expect(deleteMutateMock).not.toHaveBeenCalled()
    })

    it('should wrap strings with "" before calling mutation to ensure a string is not casted into number', () => {
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

        const value = '1'
        result.current.mutate({
            fieldId: 1,
            ticketId: 1,
            value,
        })
        expect(updateMutateMock).toHaveBeenNthCalledWith(1, {
            id: 1,
            ticketId: 1,
            data: JSON.stringify(value),
        })
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
        expect(
            useUpdateTicketCustomFieldMock.mock.calls[0][0]?.mutation
                ?.cacheTime,
        ).toBe(cacheTime)
    })

    it('should invalidate proper query data on success if not provided with another success handler', () => {
        const onSuccess = jest.fn()
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        const { rerender } = renderHook<
            ReturnType<typeof useUpdateOrDeleteTicketFieldValue>,
            { onSuccess?: jest.Mock }
        >((props) => useUpdateOrDeleteTicketFieldValue(props, {}), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
            initialProps: { onSuccess },
        })

        expect(
            useUpdateTicketCustomFieldMock.mock.calls[0][0]?.mutation
                ?.onSuccess,
        ).toBe(onSuccess)
        expect(invalidateQueryMock).not.toHaveBeenCalled()
        // we can’t only provide undefined here because it would then keep the old params 🤷
        rerender({})
        useUpdateTicketCustomFieldMock.mock.calls[1][0]?.mutation?.onSuccess!(
            axiosSuccessResponse({
                field: ticketDropdownFieldDefinition as TicketCustomFieldValueField,
                value: undefined,
                prediction: null,
            }),
            {
                id: dataToMutate.fieldId,
                ticketId: dataToMutate.ticketId,
                data: '',
            },
            undefined,
        )
        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: queryKeys.tickets.listTicketCustomFields(
                dataToMutate.ticketId,
            ),
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

            useDeleteTicketCustomFieldMock.mock.calls[0][0]?.mutation?.onError!(
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
                { id: dataToMutate.fieldId, ticketId: dataToMutate.ticketId },
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
        useUpdateTicketCustomFieldMock.mockImplementation(() => {
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
            } as unknown as ReturnType<typeof useUpdateTicketCustomField>
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
