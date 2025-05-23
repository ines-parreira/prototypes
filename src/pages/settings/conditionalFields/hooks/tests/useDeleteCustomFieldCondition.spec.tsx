import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    queryKeys,
    useDeleteCustomFieldCondition as useDelete,
} from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import useDeleteCustomFieldCondition from '../useDeleteCustomFieldCondition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useDeleteCustomFieldConditionMock = assumeMock(useDelete)

const mockStore = configureMockStore([thunk])()

describe('useDeleteCustomFieldCondition', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('should dispatch success notification on success and invalidate proper query data', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useDeleteCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useDeleteCustomFieldConditionMock.mock.calls[0][0]?.mutation!
            .onSuccess!(
            axiosSuccessResponse(customFieldCondition) as any,
            { id: customFieldCondition.id },
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey:
                queryKeys.customFieldConditions.listCustomFieldConditions(),
        })
        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Success,
                    message: 'Successfully deleted condition',
                },
            },
        ])
    })

    it('should dispatch failure notification on error', () => {
        renderHook(() => useDeleteCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useDeleteCustomFieldConditionMock.mock.calls[0][0]?.mutation!.onError!(
            {},
            { id: customFieldCondition.id },
            undefined,
        )

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                    message: 'Failed to delete condition',
                },
            },
        ])
    })
})
