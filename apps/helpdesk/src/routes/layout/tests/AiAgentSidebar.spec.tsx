import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import { AiAgentSidebar } from '../sidebars/AiAgentSidebar'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock(
    'pages/aiAgent/components/AiAgentNavbar/ActionDrivenNavigation',
    () => ({
        ActionDrivenNavigation: () => <div>ActionDrivenNavigation</div>,
    }),
)

jest.mock(
    'pages/aiAgent/components/ShoppingAssistant/ShoppingAssistantPromoCard',
    () => ({
        ShoppingAssistantPromoCard: () => <div>ShoppingAssistantPromoCard</div>,
    }),
)

jest.mock(
    'pages/aiAgent/Overview/components/PostOnboardingUserNudges/PostOnboardingUserNudges',
    () => ({
        PostOnboardingUserNudges: () => <div>PostOnboardingUserNudges</div>,
    }),
)

const mockIntegrations = [{ id: 1, name: 'test-store' }]

const renderComponent = (isCollapsed = false) =>
    render(
        <MemoryRouter>
            <MockSidebarProvider isCollapsed={isCollapsed}>
                <AiAgentSidebar />
            </MockSidebarProvider>
        </MemoryRouter>,
    )

describe('AiAgentSidebar', () => {
    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(mockIntegrations)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders nothing when there are no store integrations', () => {
        mockUseAppSelector.mockReturnValue([])

        const { container } = renderComponent()

        expect(container).toBeEmptyDOMElement()
    })

    describe('when expanded', () => {
        it('renders ActionDrivenNavigation', () => {
            renderComponent()

            expect(
                screen.getByText('ActionDrivenNavigation'),
            ).toBeInTheDocument()
        })

        it('renders ShoppingAssistantPromoCard', () => {
            renderComponent()

            expect(
                screen.getByText('ShoppingAssistantPromoCard'),
            ).toBeInTheDocument()
        })

        it('renders PostOnboardingUserNudges', () => {
            renderComponent()

            expect(
                screen.getByText('PostOnboardingUserNudges'),
            ).toBeInTheDocument()
        })
    })

    describe('when collapsed', () => {
        it('renders ActionDrivenNavigation', () => {
            renderComponent(true)

            expect(
                screen.getByText('ActionDrivenNavigation'),
            ).toBeInTheDocument()
        })

        it('does not render ShoppingAssistantPromoCard', () => {
            renderComponent(true)

            expect(
                screen.queryByText('ShoppingAssistantPromoCard'),
            ).not.toBeInTheDocument()
        })

        it('does not render PostOnboardingUserNudges', () => {
            renderComponent(true)

            expect(
                screen.queryByText('PostOnboardingUserNudges'),
            ).not.toBeInTheDocument()
        })
    })
})
