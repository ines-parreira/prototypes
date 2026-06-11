import { history } from '@repo/routing'
import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockDeleteIntegrationHandler } from '@gorgias/helpdesk-mocks'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { DELETE_INTEGRATION_SUCCESS } from 'state/integrations/constants'

import { useDeleteEmailIntegration } from '../useDeleteEmailIntegration'

jest.mock('hooks/useAppDispatch')
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('models/api/types')

const useAppDispatchMock = assumeMock(useAppDispatch)
const isGorgiasApiErrorMock = assumeMock(isGorgiasApiError)
const deleteIntegrationHandler = mockDeleteIntegrationHandler()
const server = setupServer(deleteIntegrationHandler.handler)

describe('useDeleteEmailIntegration', () => {
    const mockDispatch = jest.fn()
    const mockPush = jest.fn()

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        history.push = mockPush
        isGorgiasApiErrorMock.mockReturnValue(false)
        useAppDispatchMock.mockReturnValue(mockDispatch)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should handle successful deletion', async () => {
        const integration = { id: 'test-id' }
        const waitForDeleteIntegrationRequest =
            deleteIntegrationHandler.waitForRequest(server)

        const { result } = renderHook(() =>
            useDeleteEmailIntegration(integration as any),
        )

        result.current.deleteIntegration()

        await waitForDeleteIntegrationRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe(
                '/api/integrations/test-id',
            )
        })

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({
                type: DELETE_INTEGRATION_SUCCESS,
                id: integration.id,
            })
            expect(mockPush).toHaveBeenCalledWith(expect.any(String))
        })
    })

    it('should handle deletion error', async () => {
        const integration = { id: 'test-id' }
        isGorgiasApiErrorMock.mockReturnValue(true)
        server.use(
            mockDeleteIntegrationHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'Error message' } } as never,
                    { status: 400 },
                ),
            ).handler,
        )

        const { result } = renderHook(() =>
            useDeleteEmailIntegration(integration as any),
        )

        result.current.deleteIntegration()

        await waitFor(() => {
            const toast = screen.getByRole('status', { name: 'Error message' })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle deletion error with default message', async () => {
        const integration = { id: 'test-id' }
        isGorgiasApiErrorMock.mockReturnValue(false)
        server.use(
            mockDeleteIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useDeleteEmailIntegration(integration as any),
        )

        result.current.deleteIntegration()

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to delete integration',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
