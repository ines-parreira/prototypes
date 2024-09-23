import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    useDeleteWorkflowConfigurationTemplate,
    workflowsConfigurationTemplateDefinitionKeys,
} from 'models/workflows/queries'
import {NotificationStatus} from 'state/notifications/types'
import useDeleteActionTemplate from '../useDeleteActionTemplate'

jest.mock('models/workflows/queries')

const queryClient = mockQueryClient()

const mockStore = configureMockStore([thunk])()
const mockUseDeleteWorkflowConfigurationTemplate =
    useDeleteWorkflowConfigurationTemplate as jest.Mock

mockUseDeleteWorkflowConfigurationTemplate.mockImplementation(
    ({onSuccess}: {onSuccess: () => void}) => ({
        mutateAsync: jest.fn().mockImplementation(() => {
            onSuccess()
        }),
    })
)

describe('useDeleteActionTemplate()', () => {
    beforeEach(() => {
        mockStore.clearActions()
    })

    it('should dispatch success notification on success and invalidate proper query data', async () => {
        const invalidateQuerySpy = jest.spyOn(queryClient, 'invalidateQueries')

        const {result} = renderHook(() => useDeleteActionTemplate(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.deleteActionTemplate([{internal_id: 'someid'}])

        expect(invalidateQuerySpy).toHaveBeenLastCalledWith({
            queryKey: workflowsConfigurationTemplateDefinitionKeys.all(),
        })
        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Success,
                    message: 'Successfully deleted',
                },
            },
        ])
    })
})
