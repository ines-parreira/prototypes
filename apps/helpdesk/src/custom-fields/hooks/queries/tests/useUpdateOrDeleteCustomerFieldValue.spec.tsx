import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useDeleteCustomerCustomFieldValue,
    useUpdateCustomerCustomFieldValue,
} from '@gorgias/helpdesk-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useUpdateOrDeleteCustomerFieldValue } from '../useUpdateOrDeleteCustomerFieldValue'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useUpdateCustomerCustomFieldValueMock = assumeMock(
    useUpdateCustomerCustomFieldValue,
)
const useDeleteCustomerCustomFieldValueMock = assumeMock(
    useDeleteCustomerCustomFieldValue,
)

const updateMutateMock = jest.fn()
const deleteMutateMock = jest.fn()

const mockStore = configureMockStore([thunk])()

describe('useUpdateOrDeleteCustomerFieldValue', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useUpdateCustomerCustomFieldValueMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdateCustomerCustomFieldValue>
        })

        useDeleteCustomerCustomFieldValueMock.mockImplementation(() => {
            return {
                mutate: deleteMutateMock,
            } as unknown as ReturnType<typeof useDeleteCustomerCustomFieldValue>
        })
    })

    const dataToMutate = {
        customerId: 1,
        fieldId: 1,
    }

    it('should not do any mutation if disabled', () => {
        const { result } = renderHook(
            () =>
                useUpdateOrDeleteCustomerFieldValue({
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
            () => useUpdateOrDeleteCustomerFieldValue(),
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
            customerId: dataToMutate.customerId,
            id: dataToMutate.fieldId,
        })

        updateMutateMock.mockClear()
        deleteMutateMock.mockClear()

        const dataToMutateWithValue = { ...dataToMutate, value: 'foo' }
        result.current.mutate(dataToMutateWithValue)
        expect(updateMutateMock).toHaveBeenNthCalledWith(1, {
            id: dataToMutateWithValue.fieldId,
            customerId: dataToMutateWithValue.customerId,
            data: dataToMutateWithValue.value,
        })
        expect(deleteMutateMock).not.toHaveBeenCalled()
    })
})
