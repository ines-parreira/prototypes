import { act, renderHook, waitFor } from '@testing-library/react'

import type {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getInstallationStatuses } from 'state/integrations/actions'

import useSpqInstallationStatus from './useSpqInstallationStatus'

jest.mock('state/integrations/actions', () => ({
    getInstallationStatuses: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseAppSelector = jest.requireMock('hooks/useAppSelector') as jest.Mock

const mockGetInstallationStatuses = jest.mocked(getInstallationStatuses)

const mockShopifyIntegration = {
    id: 123,
} as unknown as ShopifyIntegration

const createMockChatIntegration = (
    appId: string,
    shopIntegrationId: number,
): GorgiasChatIntegration =>
    ({
        id: Number(appId),
        type: IntegrationType.GorgiasChat,
        meta: {
            app_id: appId,
            shop_integration_id: shopIntegrationId,
        },
    }) as unknown as GorgiasChatIntegration

describe('useSpqInstallationStatus', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetInstallationStatuses.mockResolvedValue({
            installationStatuses: [],
        })
        mockUseAppSelector.mockReturnValue([
            createMockChatIntegration('1', 123),
        ])
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    it('should return undefined and not loaded when shopifyIntegration is undefined', async () => {
        const { result } = renderHook(() => useSpqInstallationStatus(undefined))

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBeUndefined()
    })

    it('should call both spq/status endpoint and getInstallationStatuses', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: true }),
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/integrations/shopify/123/spq/status/',
        )
        expect(mockGetInstallationStatuses).toHaveBeenCalled()
    })

    it('should return isSpqInstalled true when spq/status returns is_installed true', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: true }),
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        expect(result.current.isLoaded).toBe(false)

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(true)
    })

    it('should return isSpqInstalled false when both sources return false', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: false }),
        })

        mockGetInstallationStatuses.mockResolvedValue({
            installationStatuses: [
                {
                    applicationId: 1,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    embeddedSpqInstalled: false,
                    minimumSnippetVersion: null,
                    isDuringBusinessHours: false,
                },
            ],
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(false)
    })

    it('should return isSpqInstalled true when embeddedSpqInstalled is true from installation statuses', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: false }),
        })

        mockGetInstallationStatuses.mockResolvedValue({
            installationStatuses: [
                {
                    applicationId: 1,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    embeddedSpqInstalled: true,
                    minimumSnippetVersion: null,
                    isDuringBusinessHours: false,
                },
            ],
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(true)
    })

    it('should return isSpqInstalled true when any chat for the store has embeddedSpqInstalled true', async () => {
        mockUseAppSelector.mockReturnValue([
            createMockChatIntegration('1', 123),
            createMockChatIntegration('2', 123),
        ])

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: false }),
        })

        mockGetInstallationStatuses.mockResolvedValue({
            installationStatuses: [
                {
                    applicationId: 1,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    embeddedSpqInstalled: false,
                    minimumSnippetVersion: null,
                    isDuringBusinessHours: false,
                },
                {
                    applicationId: 2,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    embeddedSpqInstalled: true,
                    minimumSnippetVersion: null,
                    isDuringBusinessHours: false,
                },
            ],
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(true)
    })

    it('should ignore installation statuses for chats not associated with the store', async () => {
        mockUseAppSelector.mockReturnValue([
            createMockChatIntegration('1', 123),
            createMockChatIntegration('2', 456),
        ])

        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: false }),
        })

        mockGetInstallationStatuses.mockResolvedValue({
            installationStatuses: [
                {
                    applicationId: 1,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    embeddedSpqInstalled: false,
                    minimumSnippetVersion: null,
                    isDuringBusinessHours: false,
                },
                {
                    applicationId: 2,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    embeddedSpqInstalled: true,
                    minimumSnippetVersion: null,
                    isDuringBusinessHours: false,
                },
            ],
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(false)
    })

    it('should return isSpqInstalled false when installationStatuses is empty', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ is_installed: false }),
        })

        mockGetInstallationStatuses.mockResolvedValue({
            installationStatuses: [],
        })

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(false)
    })

    it('should handle fetch error and set isSpqInstalled to undefined', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'))

        const { result } = renderHook(() =>
            useSpqInstallationStatus(mockShopifyIntegration),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBeUndefined()
        expect(consoleErrorSpy).toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
    })

    it('should refetch when shopifyIntegration id changes', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ is_installed: true }),
            })
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ is_installed: false }),
            })

        const { result, rerender } = renderHook(
            (props: { integration: ShopifyIntegration | undefined }) =>
                useSpqInstallationStatus(props.integration),
            {
                initialProps: { integration: mockShopifyIntegration },
            },
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(result.current.isSpqInstalled).toBe(true)

        const updatedIntegration: ShopifyIntegration = {
            ...mockShopifyIntegration,
            id: 456,
        }

        await act(async () => {
            rerender({ integration: updatedIntegration })
        })

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
            expect(result.current.isSpqInstalled).toBe(false)
        })

        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(global.fetch).toHaveBeenLastCalledWith(
            '/integrations/shopify/456/spq/status/',
        )
    })

    it('should not fetch when shopifyIntegration has no id', async () => {
        global.fetch = jest.fn()

        const integrationWithoutId = {
            ...mockShopifyIntegration,
            id: undefined,
        } as unknown as ShopifyIntegration

        const { result } = renderHook(() =>
            useSpqInstallationStatus(integrationWithoutId),
        )

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true)
        })

        expect(global.fetch).not.toHaveBeenCalled()
        expect(result.current.isSpqInstalled).toBeUndefined()
    })
})
