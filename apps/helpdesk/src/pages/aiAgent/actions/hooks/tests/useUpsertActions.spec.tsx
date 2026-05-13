import { assumeMock, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { useUpsertStoreWorkflowsConfiguration } from 'models/workflows/queries'

import { handleError } from '../errorHandler'
import useUpsertAction from '../useUpsertAction'
import { actionConfigurationFixture } from './actions.fixtures'

jest.mock('models/workflows/queries')
const useUpsertWorkflowConfigurationMock = assumeMock(
    useUpsertStoreWorkflowsConfiguration,
)

jest.mock('../errorHandler')

describe('useUpsertAction', () => {
    const internalId = 1
    const shopName = 'shop-name'
    const shopType = 'shop-type'

    beforeEach(() => {
        useUpsertWorkflowConfigurationMock.mockClear()
    })

    it('creates store action configuration', async () => {
        renderHook(() => useUpsertAction('create', shopName, shopType))

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(
            await screen.findByRole('status', {
                name: 'Successfully created Action',
            }),
        ).toBeInTheDocument()
    })

    it('updates store action configuration', async () => {
        renderHook(() => useUpsertAction('update', shopName, shopType))

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(
            await screen.findByRole('status', {
                name: 'Successfully updated Action',
            }),
        ).toBeInTheDocument()
    })

    it('should call handleError on error', () => {
        renderHook(() => useUpsertAction('update', shopName, shopType))

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
        )
    })
})
