import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'
import { screen } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { HomeSidebar } from '../sidebars/HomeSidebar'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))

jest.mock('routes/layout/sidebars/CollapsedHomeSidebar', () => ({
    CollapsedHomeSidebar: () => <div>CollapsedHomeSidebar</div>,
}))

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseCurrentUserRole = assumeMock(useCurrentUserRole)

function renderHomeSidebar(isCollapsed = false) {
    return render(
        <MockSidebarProvider isCollapsed={isCollapsed}>
            <HomeSidebar />
        </MockSidebarProvider>,
    )
}

describe('HomeSidebar', () => {
    beforeEach(() => {
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
            currentUser: { id: 1, role: { name: 'viewer' } },
        })
    })

    it('should render CollapsedHomeSidebar when the sidebar is collapsed', () => {
        renderHomeSidebar(true)

        expect(screen.getByText('CollapsedHomeSidebar')).toBeInTheDocument()
    })

    it('should render the expanded view when the sidebar is not collapsed', () => {
        renderHomeSidebar(false)

        expect(
            screen.queryByText('CollapsedHomeSidebar'),
        ).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Inbox/i })).toBeInTheDocument()
    })

    it('should render the always-visible product links', () => {
        renderHomeSidebar()

        expect(screen.getByRole('link', { name: /Inbox/i })).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Analytics/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Workflows/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Customers/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Settings/i }),
        ).toBeInTheDocument()
    })

    it('should render the AI Agent link when user has Agent role', () => {
        renderHomeSidebar()

        expect(
            screen.getByRole('link', { name: /AI Agent/i }),
        ).toBeInTheDocument()
    })

    it('should not render the AI Agent link when user does not have Agent role', () => {
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: false,
            hasRole: jest.fn().mockReturnValue(false),
            currentUser: { id: 1, role: { name: 'observer-agent' } },
        })

        renderHomeSidebar()

        expect(
            screen.queryByRole('link', { name: /AI Agent/i }),
        ).not.toBeInTheDocument()
    })

    it('should show the Upgrade tag on AI Agent when the user has no access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderHomeSidebar()

        expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should not show the Upgrade tag on AI Agent when the user has access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderHomeSidebar()

        expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
    })

    it('should render the AI Journey link when AiJourneyEnabled flag is on', () => {
        mockUseFlagWithLoading.mockImplementation((key: FeatureFlagKey) =>
            key === FeatureFlagKey.AiJourneyEnabled
                ? { value: true, isLoading: false }
                : { value: false, isLoading: false },
        )

        renderHomeSidebar()

        expect(
            screen.getByRole('link', { name: /AI Journey/i }),
        ).toBeInTheDocument()
    })

    it('should not render the AI Journey link when AiJourneyEnabled flag is off', () => {
        renderHomeSidebar()

        expect(
            screen.queryByRole('link', { name: /AI Journey/i }),
        ).not.toBeInTheDocument()
    })

    it('should render the Convert link for admin users', () => {
        renderHomeSidebar()

        expect(
            screen.getByRole('link', { name: /Convert/i }),
        ).toBeInTheDocument()
    })

    it('should not render the Convert link for non-admin users', () => {
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: false,
            hasRole: jest.fn().mockReturnValue(true),
            currentUser: { id: 1, role: { name: 'agent' } },
        })

        renderHomeSidebar()

        expect(
            screen.queryByRole('link', { name: /Convert/i }),
        ).not.toBeInTheDocument()
    })
})
