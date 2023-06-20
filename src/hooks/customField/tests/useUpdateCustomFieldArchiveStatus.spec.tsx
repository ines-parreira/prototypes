import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {NotificationStatus} from 'state/notifications/types'
import {
    useUpdatePartialCustomField,
    customFieldDefinitionKeys,
} from 'models/customField/queries'
import {assumeMock} from 'utils/testing'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {useUpdateCustomFieldArchiveStatus} from '../useUpdateCustomFieldArchiveStatus'

const queryClient = createTestQueryClient()

jest.mock('models/customField/queries')
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
        const {result} = renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id
                ),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )

        const expectedData = [
            ticketDropdownFieldDefinition.id,
            {deactivated_datetime: '1970-01-01T00:00:00.042Z'},
        ]

        result.current.mutate(true)
        expect(updateMutateMock).toHaveBeenNthCalledWith(1, expectedData)

        void result.current.mutateAsync(true)
        expect(updateMutateMock).toHaveBeenNthCalledWith(2, expectedData)
    })

    it('should dispatch success notification on success and invalidate proper query data', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id
                ),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )

        useUpdatePartialCustomFieldMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(ticketDropdownFieldDefinition),
            [ticketDropdownFieldDefinition.id, {deactivated_datetime: '42'}],
            undefined
        )
        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: customFieldDefinitionKeys.all(),
        })

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Success,
                },
            },
        ])
    })

    it('should dispatch failure notification on error', () => {
        renderHook(
            () =>
                useUpdateCustomFieldArchiveStatus(
                    ticketDropdownFieldDefinition.id
                ),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )

        useUpdatePartialCustomFieldMock.mock.calls[0][0]?.onError!(
            {},
            [ticketDropdownFieldDefinition.id, {deactivated_datetime: '42'}],
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
