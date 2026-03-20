import { waitFor } from '@testing-library/react'

import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'
import { getInstallationStatus } from 'state/integrations/actions'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useInstallationStatus } from './useInstallationStatus'

jest.mock('state/integrations/actions', () => ({
    getInstallationStatus: jest.fn(),
}))

const mockGetInstallationStatus = getInstallationStatus as jest.MockedFunction<
    typeof getInstallationStatus
>

const FALLBACK = {
    installed: false,
    installedOnShopifyCheckout: false,
    embeddedSpqInstalled: false,
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
}

describe('useInstallationStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns FALLBACK when appId is undefined and does not call getInstallationStatus', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useInstallationStatus(undefined),
        )

        expect(result.current).toEqual(FALLBACK)
        expect(mockGetInstallationStatus).not.toHaveBeenCalled()
    })

    it('returns FALLBACK while query is loading', () => {
        mockGetInstallationStatus.mockReturnValue(new Promise(() => {}))

        const { result } = renderHookWithQueryClientProvider(() =>
            useInstallationStatus('app-123'),
        )

        expect(result.current).toEqual(FALLBACK)
    })

    it('returns mapped data when query resolves', async () => {
        mockGetInstallationStatus.mockResolvedValue({
            applicationId: 1,
            hasBeenRequestedOnce: true,
            installed: false,
            installedOnShopifyCheckout: true,
            embeddedSpqInstalled: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
            isDuringBusinessHours: false,
        })

        const { result } = renderHookWithQueryClientProvider(() =>
            useInstallationStatus('app-123'),
        )

        await waitFor(() => {
            expect(result.current.installed).toBe(false)
        })

        expect(result.current).toEqual({
            installed: false,
            installedOnShopifyCheckout: true,
            embeddedSpqInstalled: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
        })
        expect(mockGetInstallationStatus).toHaveBeenCalledWith('app-123')
    })

    it('converts falsy installedOnShopifyCheckout and embeddedSpqInstalled to boolean', async () => {
        mockGetInstallationStatus.mockResolvedValue({
            applicationId: 1,
            hasBeenRequestedOnce: false,
            installed: true,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
            isDuringBusinessHours: false,
        })

        const { result } = renderHookWithQueryClientProvider(() =>
            useInstallationStatus('app-456'),
        )

        await waitFor(() => {
            expect(result.current.minimumSnippetVersion).toBeNull()
        })

        expect(result.current).toEqual({
            installed: true,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
        })
    })

    it('calls getInstallationStatus with the provided appId', async () => {
        mockGetInstallationStatus.mockResolvedValue({
            applicationId: 1,
            hasBeenRequestedOnce: true,
            installed: true,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
            isDuringBusinessHours: true,
        })

        renderHookWithQueryClientProvider(() =>
            useInstallationStatus('my-app-id'),
        )

        await waitFor(() => {
            expect(mockGetInstallationStatus).toHaveBeenCalledWith('my-app-id')
        })
    })
})
