import React from 'react'

import { renderHook } from '@repo/testing'
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

import { ActionsApp } from '../../types'
import useEditActionsApp from '../useEditActionsApp'

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

describe('useEditActionsApp()', () => {
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

        const { result } = renderHook(() => useEditActionsApp(actionsApp.id), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.editActionsApp([{ id: actionsApp.id }, actionsApp])

        expect(invalidateQuerySpy).toHaveBeenLastCalledWith({
            queryKey: actionsAppDefinitionKeys.get(actionsApp.id),
        })
        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Success,
                    message: 'Successfully updated',
                },
            },
        ])
    })
})
