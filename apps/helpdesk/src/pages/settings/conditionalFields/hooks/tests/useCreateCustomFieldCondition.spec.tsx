import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    queryKeys,
    useCreateCustomFieldCondition as useCreate,
} from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import useCreateCustomFieldCondition from '../useCreateCustomFieldCondition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
const useCreateCustomFieldConditionMock = assumeMock(useCreate)

const mockStore = configureMockStore([thunk])()

describe('useCreateCustomFieldCondition', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('should dispatch success notification on success and invalidate proper query data', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useCreateCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useCreateCustomFieldConditionMock.mock.calls[0][0]?.mutation!
            .onSuccess!(
            axiosSuccessResponse(customFieldCondition) as any,
            { data: customFieldCondition },
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
                    message: 'Condition created successfully',
                },
            },
        ])
    })

    it('should dispatch failure notification on error', () => {
        renderHook(() => useCreateCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useCreateCustomFieldConditionMock.mock.calls[0][0]?.mutation!.onError!(
            {},
            { data: customFieldCondition },
            undefined,
        )

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                    message: 'Failed to create condition',
                },
            },
        ])
    })
})
