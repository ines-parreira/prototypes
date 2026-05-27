import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { SidebarProvider } from '@repo/navigation'
import { history } from '@repo/routing'
import { assumeMock, render } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { Product, productMetadata } from 'routes/layout/productMetadata'

import { CollapsedHomeSidebar } from '../sidebars/CollapsedHomeSidebar'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))
const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))
const mockUseCurrentUserRole = assumeMock(useCurrentUserRole)

// Default setup: isAdmin=true, hasRole=true (agent), AiJourney=false
// Visible products: Inbox, AI Agent, Convert, Analytics, Workflows, Customers, Settings → 7 buttons
const BUTTON_COUNT_DEFAULT = 7

describe('CollapsedHomeSidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: true,
            hasRole: jest.fn().mockReturnValue(true),
            currentUser: { id: 1, role: { name: 'admin' } },
        })
    })

    it('renders icon buttons for all visible products', () => {
        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        expect(screen.getAllByRole('radio')).toHaveLength(BUTTON_COUNT_DEFAULT)
    })

    it('renders one additional button when the user has the agent role', () => {
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: true,
            hasRole: jest.fn().mockReturnValue(false),
            currentUser: { id: 1, role: { name: 'observer-agent' } },
        })

        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        expect(screen.getAllByRole('radio')).toHaveLength(
            BUTTON_COUNT_DEFAULT - 1,
        )
    })

    it('does not render the AI Agent button when the user lacks the agent role', () => {
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: true,
            hasRole: jest.fn().mockReturnValue(false),
            currentUser: { id: 1, role: { name: 'observer-agent' } },
        })

        const { rerender } = render(<CollapsedHomeSidebar />, {
            wrapper: SidebarProvider,
        })
        const countWithoutAiAgent = screen.getAllByRole('radio').length

        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: true,
            hasRole: jest.fn().mockReturnValue(true),
            currentUser: { id: 1, role: { name: 'agent' } },
        })
        rerender(<CollapsedHomeSidebar />)

        expect(screen.getAllByRole('radio').length).toBe(
            countWithoutAiAgent + 1,
        )
    })

    it('renders one additional button when the AiJourneyEnabled flag is on', () => {
        mockUseFlagWithLoading.mockImplementation((key: FeatureFlagKey) =>
            key === FeatureFlagKey.AiJourneyEnabled
                ? { value: true, isLoading: false }
                : { value: false, isLoading: false },
        )

        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        expect(screen.getAllByRole('radio')).toHaveLength(
            BUTTON_COUNT_DEFAULT + 1,
        )
    })

    it('does not render the AI Journey button when the AiJourneyEnabled flag is off', () => {
        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        expect(screen.getAllByRole('radio')).toHaveLength(BUTTON_COUNT_DEFAULT)
    })

    it('does not render the Convert button for non-admin users', () => {
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: false,
            hasRole: jest.fn().mockReturnValue(true),
            currentUser: { id: 1, role: { name: 'agent' } },
        })

        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        expect(screen.getAllByRole('radio')).toHaveLength(
            BUTTON_COUNT_DEFAULT - 1,
        )
    })

    it('does not mark any button as selected', () => {
        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        screen.getAllByRole('radio').forEach((button) => {
            expect(button).not.toHaveAttribute('aria-checked', 'true')
        })
    })

    it('navigates to the Inbox path when clicking the first button', async () => {
        const user = userEvent.setup()
        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[0])

        expect(history.push).toHaveBeenCalledWith(
            productMetadata[Product.Inbox].defaultPath,
        )
    })

    it('navigates to the AI Agent path when clicking the second button', async () => {
        const user = userEvent.setup()
        render(<CollapsedHomeSidebar />, { wrapper: SidebarProvider })

        const buttons = screen.getAllByRole('radio')
        // Default order: Inbox[0], AI Agent[1], Convert[2], Analytics[3]...
        await user.click(buttons[1])

        expect(history.push).toHaveBeenCalledWith(
            productMetadata[Product.AiAgent].defaultPath,
        )
    })
})
