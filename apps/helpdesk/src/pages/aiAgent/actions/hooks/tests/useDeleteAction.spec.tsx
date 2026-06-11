import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    useDeleteWorkflowsConfiguration,
} from 'models/workflows/queries'

import { handleError } from '../errorHandler'
import { useDeleteAction } from '../useDeleteAction'

jest.mock('models/workflows/queries')
const useDeleteWorkflowConfigurationMock = assumeMock(
    useDeleteWorkflowsConfiguration,
)

jest.mock('../errorHandler')

describe('useDeleteAction', () => {
    const internalId = 1
    const name = 'action-name'
    const shopName = 'shop-name'
    const shopType = 'shop-type'

    beforeEach(() => {
        useDeleteWorkflowConfigurationMock.mockClear()
    })

    it('accepts a name param, shows success toast, and invalidates list queries', async () => {
        const invalidateQueryMock = jest.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        )
        renderHook(() => useDeleteAction(name, shopName, shopType))

        useDeleteWorkflowConfigurationMock.mock.calls[0][0]?.onSettled!(
            undefined,
            {},
            [internalId],
            undefined,
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: storeWorkflowsConfigurationDefinitionKeys.list({
                storeName: shopName,
                storeType: shopType,
            }),
        })

        useDeleteWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(null) as any,
            [internalId],
            undefined,
        )

        expect(
            await screen.findByRole('status', {
                name: `Successfully deleted Action ${name}`,
            }),
        ).toBeInTheDocument()

        invalidateQueryMock.mockRestore()
    })

    it('should call handleError on error', () => {
        renderHook(() => useDeleteAction(name, shopName, shopType))

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
        )
    })
})
