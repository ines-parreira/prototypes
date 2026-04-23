import { SplitFactoryProvider } from '@splitsoftware/splitio-react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as harness from '../engines/harness'
import { FeatureFlagsProvider } from '../FeatureFlagsProvider'

vi.mock('@splitsoftware/splitio-react', () => ({
    SplitFactoryProvider: vi.fn(({ children }) => (
        <div data-testid="split-provider">{children}</div>
    )),
}))

const mockSplitFactoryProvider = vi.mocked(SplitFactoryProvider)

describe('FeatureFlagsProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders children correctly', () => {
        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('passes the harness factory to SplitFactoryProvider', () => {
        const fakeFactory = { client: vi.fn() } as any
        vi.spyOn(harness, 'getFactory').mockReturnValue(fakeFactory)

        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        expect(mockSplitFactoryProvider).toHaveBeenCalledWith(
            expect.objectContaining({ factory: fakeFactory }),
            expect.anything(),
        )
    })

    it('passes undefined factory when harness has none', () => {
        vi.spyOn(harness, 'getFactory').mockReturnValue(null)

        render(
            <FeatureFlagsProvider>
                <div>Test Child</div>
            </FeatureFlagsProvider>,
        )

        expect(mockSplitFactoryProvider).toHaveBeenCalledWith(
            expect.objectContaining({ factory: undefined }),
            expect.anything(),
        )
    })
})
