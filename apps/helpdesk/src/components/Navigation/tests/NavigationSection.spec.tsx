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

describe('NavigationSection', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('without wayfinding flag', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('renders section with trigger and content', () => {
            render(
                <Navigation.Root>
                    <Navigation.Section value="section1">
                        <Navigation.SectionTrigger>
                            Test Section
                        </Navigation.SectionTrigger>
                        <Navigation.SectionContent>
                            Test Content
                        </Navigation.SectionContent>
                    </Navigation.Section>
                </Navigation.Root>,
            )

            expect(screen.getByText('Test Section')).toBeInTheDocument()
        })
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('renders full section content', () => {
            render(
                <Navigation.Root>
                    <Navigation.Section value="section1" icon="flows">
                        <Navigation.SectionTrigger icon="flows">
                            Test Section
                        </Navigation.SectionTrigger>
                        <Navigation.SectionContent>
                            Test Content
                        </Navigation.SectionContent>
                    </Navigation.Section>
                </Navigation.Root>,
            )

            expect(screen.getByText('Test Section')).toBeInTheDocument()
        })
    })
})
