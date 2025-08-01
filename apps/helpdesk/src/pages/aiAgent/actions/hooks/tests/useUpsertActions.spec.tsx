import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { useUpsertStoreWorkflowsConfiguration } from 'models/workflows/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { handleError } from '../errorHandler'
import useUpsertAction from '../useUpsertAction'
import { actionConfigurationFixture } from './actions.fixtures'

const queryClient = mockQueryClient()

jest.mock('models/workflows/queries')
const useUpsertWorkflowConfigurationMock = assumeMock(
    useUpsertStoreWorkflowsConfiguration,
)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useUpsertAction', () => {
    const internalId = 1
    const shopName = 'shop-name'
    const shopType = 'shop-type'

    beforeEach(() => {
        useUpsertWorkflowConfigurationMock.mockClear()
    })

    it('create store action configuration', () => {
        renderHook(() => useUpsertAction('create', shopName, shopType), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully created Action',
            status: NotificationStatus.Success,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('update store action configuration', () => {
        renderHook(() => useUpsertAction('update', shopName, shopType), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully updated Action',
            status: NotificationStatus.Success,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('should call handleError on error', () => {
        renderHook(() => useUpsertAction('update', shopName, shopType), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const errorResponseBody = {
            message: 'error message',
        }
        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onError!(
            errorResponseBody,
            [0],
            undefined,
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            errorResponseBody,
            'Fail to update Action. Please try again later.',
            mockedDispatch,
        )
    })
})
