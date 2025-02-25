import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    queryKeys,
    useUpdateCustomFieldCondition as useUpdate,
} from '@gorgias/api-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import useUpdateCustomFieldCondition from '../useUpdateCustomFieldCondition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/api-queries')
const useUpdateCustomFieldConditionMock = assumeMock(useUpdate)

const mockStore = configureMockStore([thunk])()

describe('useUpdateCustomFieldCondition', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('should invalidate proper query data on success', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useUpdateCustomFieldCondition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldConditionMock.mock.calls[0][0]?.mutation!
            .onSuccess!(
            axiosSuccessResponse(customFieldCondition) as any,
            { id: customFieldCondition.id, data: { name: 'New name' } },
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey:
                queryKeys.customFieldConditions.listCustomFieldConditions(),
        })
    })
})
