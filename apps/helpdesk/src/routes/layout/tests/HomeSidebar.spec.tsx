import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
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

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseCurrentUserRole = assumeMock(useCurrentUserRole)

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

    it('should render the always-visible product links', () => {
        render(<HomeSidebar />)

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
        render(<HomeSidebar />)

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

        render(<HomeSidebar />)

        expect(
            screen.queryByRole('link', { name: /AI Agent/i }),
        ).not.toBeInTheDocument()
    })

    it('should show the Upgrade tag on AI Agent when the user has no access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        render(<HomeSidebar />)

        expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should not show the Upgrade tag on AI Agent when the user has access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        render(<HomeSidebar />)

        expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
    })

    it('should render the AI Journey link when AiJourneyEnabled flag is on', () => {
        mockUseFlagWithLoading.mockImplementation((key: FeatureFlagKey) =>
            key === FeatureFlagKey.AiJourneyEnabled
                ? { value: true, isLoading: false }
                : { value: false, isLoading: false },
        )

        render(<HomeSidebar />)

        expect(
            screen.getByRole('link', { name: /AI Journey/i }),
        ).toBeInTheDocument()
    })

    it('should not render the AI Journey link when AiJourneyEnabled flag is off', () => {
        render(<HomeSidebar />)

        expect(
            screen.queryByRole('link', { name: /AI Journey/i }),
        ).not.toBeInTheDocument()
    })

    it('should render the Convert link for admin users', () => {
        render(<HomeSidebar />)

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

        render(<HomeSidebar />)

        expect(
            screen.queryByRole('link', { name: /Convert/i }),
        ).not.toBeInTheDocument()
    })
})
