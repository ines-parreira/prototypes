import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {NotificationStatus} from 'state/notifications/types'
import {
    useCreateCustomField,
    customFieldDefinitionKeys,
} from 'models/customField/queries'
import {assumeMock} from 'utils/testing'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {useCreateCustomFieldDefinition} from '../useCreateCustomFieldDefinition'

const queryClient = mockQueryClient()

jest.mock('models/customField/queries')
const useCreateCustomFieldMock = assumeMock(useCreateCustomField)

const mockStore = configureMockStore([thunk])()

describe('useCreateCustomFieldDefinition', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('should dispatch success notification on success and invalidate proper query data', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useCreateCustomFieldDefinition(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useCreateCustomFieldMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(ticketDropdownFieldDefinition),
            [ticketDropdownFieldDefinition],
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
        renderHook(() => useCreateCustomFieldDefinition(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useCreateCustomFieldMock.mock.calls[0][0]?.onError!(
            {},
            [ticketDropdownFieldDefinition],
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
