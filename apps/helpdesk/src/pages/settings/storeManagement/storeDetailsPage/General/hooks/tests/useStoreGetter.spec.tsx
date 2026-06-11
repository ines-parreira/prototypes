import React from 'react'

import { render, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useHistory } from 'react-router-dom'

import { toast, Toaster } from '@gorgias/axiom'
import {
    mockBigcommerceIntegration,
    mockGetIntegrationHandler,
    mockMagento2Integration,
    mockShopifyIntegration,
} from '@gorgias/helpdesk-mocks'

import { IntegrationType } from 'models/integration/constants'

import { useStoreGetter } from '../useStoreGetter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    useAppDispatch: () => jest.fn(),
}))

describe('useStoreGetter', () => {
    const mockPush = jest.fn()
    const getStoreIntegration = (type: IntegrationType) => {
        if (type === IntegrationType.BigCommerce) {
            return mockBigcommerceIntegration({ id: 1 })
        }
        if (type === IntegrationType.Magento2) {
            return mockMagento2Integration({ id: 1 })
        }
        return mockShopifyIntegration({ id: 1 })
    }
    const getIntegrationHandler = mockGetIntegrationHandler(async () =>
        HttpResponse.json(getStoreIntegration(IntegrationType.Shopify)),
    )
    const server = setupServer(getIntegrationHandler.handler)

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

    it('should return data and loading state for valid integration', async () => {
        const { result } = renderHook(() => useStoreGetter(1))

        await waitFor(() => {
            expect(result.current.data?.data.id).toBe(1)
            expect(result.current.data?.data.type).toBe(IntegrationType.Shopify)
            expect(result.current.isFetching).toBe(false)
        })
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('should redirect and show error for invalid integration type', async () => {
        server.use(
            mockGetIntegrationHandler(async () =>
                HttpResponse.json({
                    id: 1,
                    type: 'INVALID_TYPE',
                } as never),
            ).handler,
        )

        render(<Toaster />)
        renderHook(() => useStoreGetter(1))

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                '/app/settings/store-management',
            )
        })
        await waitFor(() => {
            expect(
                screen.getAllByRole('status', {
                    name: 'Integration type mismatch',
                })[0],
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle API errors correctly', async () => {
        server.use(
            mockGetIntegrationHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'API Error Message' } } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        render(<Toaster />)
        renderHook(() => useStoreGetter(1))

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                '/app/settings/store-management',
            )
        })
        await waitFor(() => {
            expect(
                screen.getAllByRole('status', {
                    name: 'Failed to get integration',
                })[0],
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle API errors with no error message', async () => {
        server.use(
            mockGetIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        render(<Toaster />)
        renderHook(() => useStoreGetter(1))

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                '/app/settings/store-management',
            )
        })
        await waitFor(() => {
            expect(
                screen.getAllByRole('status', {
                    name: 'Failed to get integration',
                })[0],
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should accept valid store integration types', async () => {
        const validTypes = [
            IntegrationType.Shopify,
            IntegrationType.Magento2,
            IntegrationType.BigCommerce,
        ]

        for (const type of validTypes) {
            server.use(
                mockGetIntegrationHandler(async () =>
                    HttpResponse.json(getStoreIntegration(type)),
                ).handler,
            )

            const { result, unmount } = renderHook(() => useStoreGetter(1))

            await waitFor(() => {
                expect(result.current.data?.data.id).toBe(1)
                expect(result.current.data?.data.type).toBe(type)
            })
            expect(mockPush).not.toHaveBeenCalled()
            unmount()
            server.resetHandlers()
            jest.clearAllMocks()
            ;(useHistory as jest.Mock).mockReturnValue({ push: mockPush })
        }
    })
})
