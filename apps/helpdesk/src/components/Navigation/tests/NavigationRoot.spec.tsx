import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { Navigation } from '../Navigation'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

describe('NavigationRoot', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('without wayfinding flag', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('renders children', () => {
            render(
                <Navigation.Root data-testid="nav-root">
                    <div>Test Content</div>
                </Navigation.Root>,
            )

            expect(screen.getByText('Test Content')).toBeInTheDocument()
        })
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('renders children', () => {
            render(
                <Navigation.Root data-testid="nav-root">
                    <div>Test Content</div>
                </Navigation.Root>,
            )

            expect(screen.getByText('Test Content')).toBeInTheDocument()
        })
    })
})
