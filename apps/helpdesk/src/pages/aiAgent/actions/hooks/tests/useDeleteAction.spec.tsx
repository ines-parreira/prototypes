import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    useDeleteWorkflowsConfiguration,
} from 'models/workflows/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { handleError } from '../errorHandler'
import useDeleteAction from '../useDeleteAction'

const queryClient = mockQueryClient()

jest.mock('models/workflows/queries')
const useDeleteWorkflowConfigurationMock = assumeMock(
    useDeleteWorkflowsConfiguration,
)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useDeleteAction', () => {
    const internalId = 1
    const name = 'action-name'
    const shopName = 'shop-name'
    const shopType = 'shop-type'

    beforeEach(() => {
        useDeleteWorkflowConfigurationMock.mockClear()
    })

    it('should accept a name param and dispatch success notification on success and invalidate lists queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useDeleteAction(name, shopName, shopType), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        useDeleteWorkflowConfigurationMock.mock.calls[0][0]?.onSettled!(
            undefined,
            {},
            [internalId],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: storeWorkflowsConfigurationDefinitionKeys.all(),
        })

        useDeleteWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(null) as any,
            [internalId],
            undefined,
        )

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `Successfully deleted Action ${name}`,
            status: NotificationStatus.Success,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('should call handleError on error', () => {
        renderHook(() => useDeleteAction(name, shopName, shopType), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const errorResponseBody = {}
        useDeleteWorkflowConfigurationMock.mock.calls[0][0]?.onError!(
            errorResponseBody,
            [0],
            undefined,
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            errorResponseBody,
            `Failed to delete Action ${name}`,
            mockedDispatch,
        )
    })
})
