import { renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useHistory } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import { mockDeleteIntegrationHandler } from '@gorgias/helpdesk-mocks'

import { useStoreDeleter } from '../useStoreDeleter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    useAppDispatch: () => mockDispatch,
}))

jest.mock('pages/settings/storeManagement/StoreManagementProvider', () => ({
    useStoreManagementState: () => ({
        refetchIntegrations: jest.fn(),
        refetchMapping: jest.fn(),
    }),
}))

describe('useStoreDeleter', () => {
    const mockPush = jest.fn()
    const deleteIntegrationHandler = mockDeleteIntegrationHandler()
    const server = setupServer(deleteIntegrationHandler.handler)

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHistory as jest.Mock).mockReturnValue({ push: mockPush })
    })

    afterEach(() => {
        toast.dismiss()
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should handle successful integration deletion', async () => {
        const { result } = renderHook(() => useStoreDeleter())

        result.current.deleteIntegration({ id: 1 } as any)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Store is successfully deleted. It may take a minute for all channels and features to disconnect.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
    })

    it('should handle integration deletion error with custom message', async () => {
        server.use(
            mockDeleteIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 400 }),
            ).handler,
        )
        const { result } = renderHook(() => useStoreDeleter())

        result.current.deleteIntegration({ id: 1 } as any)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete integration',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle integration deletion error with default message', async () => {
        server.use(
            mockDeleteIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )
        const { result } = renderHook(() => useStoreDeleter())

        result.current.deleteIntegration({ id: 1 } as any)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete integration',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })

        expect(mockPush).not.toHaveBeenCalled()
    })
})
