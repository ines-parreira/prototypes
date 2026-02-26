import { render, screen } from '@testing-library/react'

import { MarketingSidebar } from '../sidebars/MarketingSidebar'

jest.mock('AIJourney/components', () => ({
    AiJourneyNavbar: () => <div>AiJourneyNavbar</div>,
}))

jest.mock('AIJourney/providers', () => ({
    IntegrationsProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="integrations-provider">{children}</div>
    ),
    JourneyProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="journey-provider">{children}</div>
    ),
}))

describe('MarketingSidebar', () => {
    it('should render AiJourneyNavbar component', () => {
        render(<MarketingSidebar />)
        const navbar = screen.getByText('AiJourneyNavbar')
        expect(navbar).toBeInTheDocument()
    })
})
