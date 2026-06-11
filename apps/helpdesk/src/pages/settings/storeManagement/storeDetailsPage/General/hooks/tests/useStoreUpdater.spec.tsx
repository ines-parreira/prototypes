import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockUpdateIntegrationHandler } from '@gorgias/helpdesk-mocks'

import { useStoreUpdater } from '../useStoreUpdater'

const updateIntegrationHandler = mockUpdateIntegrationHandler()
const server = setupServer(updateIntegrationHandler.handler)

describe('useStoreUpdater', () => {
    const mockRefetchStore = jest.fn()

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('returns an update mutation', () => {
        const { result } = renderHook(() => useStoreUpdater(mockRefetchStore))

        expect(result.current.updateIntegration).toEqual(expect.any(Function))
        expect(result.current.isUpdating).toBe(false)
    })

    it('shows success notification and refetches store on successful update', async () => {
        const { result } = renderHook(() => useStoreUpdater(mockRefetchStore))

        result.current.updateIntegration({
            id: 1,
            data: { name: 'Store' },
        } as any)

        const toastEl = await screen.findByRole('status', {
            name: 'Integration successfully updated',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        expect(mockRefetchStore).toHaveBeenCalled()
    })

    it('shows error notification on failed update', async () => {
        server.use(
            mockUpdateIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() => useStoreUpdater(mockRefetchStore))

        result.current.updateIntegration({
            id: 1,
            data: { name: 'Store' },
        } as any)

        const toastEl = await screen.findByRole('status', {
            name: 'Failed to update connection',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
