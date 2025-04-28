import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    actionsAppDefinitionKeys,
    useUpsertActionsApp,
} from 'models/workflows/queries'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { ActionsApp } from '../../types'
import useCreateActionsApp from '../useCreateActionsApp'

jest.mock('models/workflows/queries')

const queryClient = mockQueryClient()

const mockStore = configureMockStore([thunk])()
const mockUseUpsertActionsApp = useUpsertActionsApp as jest.Mock

mockUseUpsertActionsApp.mockImplementation(
    ({ onSuccess }: { onSuccess: () => void }) => ({
        mutateAsync: jest.fn().mockImplementation(() => {
            onSuccess()
        }),
    }),
)

describe('useCreateActionsApp()', () => {
    beforeEach(() => {
        mockStore.clearActions()
    })

    it('should dispatch success notification on success and invalidate proper query data', async () => {
        const actionsApp: ActionsApp = {
            id: 'someid',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://www.example.com',
            },
        }

        const invalidateQuerySpy = jest.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(() => useCreateActionsApp(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.createActionsApp([
            { id: actionsApp.id },
            actionsApp,
        ])

        expect(invalidateQuerySpy).toHaveBeenLastCalledWith({
            queryKey: actionsAppDefinitionKeys.all(),
        })
        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Success,
                    message: 'Successfully created',
                },
            },
        ])
    })
})
