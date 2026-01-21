import { render, screen, waitFor } from '@testing-library/react'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { FeatureFlagsProvider } from '../FeatureFlagsProvider'
import * as launchDarkly from '../launchdarkly'

vi.mock('launchdarkly-react-client-sdk', () => ({
    LDProvider: vi.fn(({ children }) => (
        <div data-testid="ld-provider">{children}</div>
    )),
}))
const mockLDProvider = vi.mocked(LDProvider)

vi.mock('@repo/hooks', () => ({
    useEffectOnce: vi.fn((callback: () => void) => callback()),
}))

const mockWaitUntilGoalsReady = vi.fn()
const mockLDClient = {
    waitUntilGoalsReady: mockWaitUntilGoalsReady,
}

vi.spyOn(launchDarkly, 'getLDClient').mockReturnValue(mockLDClient as any)

describe('FeatureFlagsProvider', () => {
    beforeAll(() => {
        window.GORGIAS_LAUNCHDARKLY_CLIENT_ID = 'test-client-id'
    })

    beforeEach(() => {
        vi.clearAllMocks()
        mockWaitUntilGoalsReady.mockResolvedValue(undefined)
        launchDarkly._setLDContext({})
    })

    it('renders children correctly', async () => {
        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('passes correct props to LDProvider', async () => {
        const testContext = { kind: 'user', key: 'test-key' }
        launchDarkly._setLDContext(testContext)

        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        await waitFor(() => {
            expect(mockLDProvider).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientSideID: 'test-client-id',
                    reactOptions: { useCamelCaseFlagKeys: false },
                    context: testContext,
                }),
                expect.anything(),
            )
        })
    })

    it('calls getLDClient and waits for goals ready', async () => {
        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        expect(launchDarkly.getLDClient).toHaveBeenCalled()
        expect(mockWaitUntilGoalsReady).toHaveBeenCalled()
    })

    it('sets ldClient after waitUntilGoalsReady resolves', async () => {
        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        await waitFor(() => {
            expect(mockLDProvider).toHaveBeenCalledWith(
                expect.objectContaining({
                    ldClient: mockLDClient,
                }),
                expect.anything(),
            )
        })
    })
})
