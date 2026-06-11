import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme/ThemeProvider'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { NewAutomateStatsOptInBanner } from './NewAutomateStatsOptInBanner'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('@repo/logging')

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const useFlagWithLoadingMock = assumeMock(useFlagWithLoading)
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const logEventMock = assumeMock(logEvent)

const renderComponent = () =>
    render(<NewAutomateStatsOptInBanner />, {
        wrapper: ThemeProvider,
    })

describe('NewAutomateStatsOptInBanner', () => {
    beforeEach(() => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useFlagWithLoadingMock.mockReturnValue({
            value: false,
            isLoading: false,
        })
    })

    it('renders the banner copy and opt-in CTA when the user has access and the flag is disabled', () => {
        renderComponent()

        expect(
            screen.getByText(
                /Opt in now for early access to the new AI Agent analytics experience\./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Rolling out gradually from May 26 to June 2\./),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /opt in to early access/i }),
        ).toBeInTheDocument()
    })

    it('renders the demo video link pointing to the Loom share URL', () => {
        renderComponent()

        const demoLink = screen.getByRole('link', { name: /the demo/i })
        expect(demoLink).toHaveAttribute(
            'href',
            'https://www.loom.com/share/81c4820e8d8c4e769d1a095701377da3',
        )
        expect(demoLink).toHaveAttribute('target', '_blank')
        expect(demoLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders the opt-in CTA as an external link to the Typeform', () => {
        renderComponent()

        const optInLink = screen.getByRole('link', {
            name: /opt in to early access/i,
        })
        expect(optInLink).toHaveAttribute(
            'href',
            'https://gorgias.typeform.com/to/XcW7zCSm',
        )
        expect(optInLink).toHaveAttribute('target', '_blank')
        expect(optInLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not render when the user has no AI Agent access', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderComponent()

        expect(
            screen.queryByText(
                /Opt in now for early access to the new AI Agent analytics experience\./,
            ),
        ).not.toBeInTheDocument()
    })

    it('renders the discover banner and dashboard CTA when the flag is enabled', () => {
        useFlagWithLoadingMock.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                ? { value: true, isLoading: false }
                : { value: false, isLoading: false },
        )

        renderComponent()

        expect(
            screen.getByText(
                /Discover the new AI and Automation analytics experience\./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                /Opt in now for early access to the new AI Agent analytics experience\./,
            ),
        ).not.toBeInTheDocument()

        const dashboardLink = screen.getByRole('link', {
            name: /go to dashboard/i,
        })
        expect(dashboardLink).toHaveAttribute(
            'href',
            '/app/stats/analytics-overview',
        )
    })

    it('renders the demo video link in the discover banner', () => {
        useFlagWithLoadingMock.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                ? { value: true, isLoading: false }
                : { value: false, isLoading: false },
        )

        renderComponent()

        const demoLink = screen.getByRole('link', { name: /the demo/i })
        expect(demoLink).toHaveAttribute(
            'href',
            'https://www.loom.com/share/81c4820e8d8c4e769d1a095701377da3',
        )
        expect(demoLink).toHaveAttribute('target', '_blank')
        expect(demoLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not log a Segment event when the dashboard CTA is clicked', async () => {
        useFlagWithLoadingMock.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                ? { value: true, isLoading: false }
                : { value: false, isLoading: false },
        )

        const { user } = renderComponent()

        await user.click(screen.getByRole('link', { name: /go to dashboard/i }))

        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('does not render while AI Agent access is loading', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: true,
        })

        renderComponent()

        expect(
            screen.queryByText(
                /Opt in now for early access to the new AI Agent analytics experience\./,
            ),
        ).not.toBeInTheDocument()
    })

    it('does not render while the new analytics dashboards flag is loading', () => {
        useFlagWithLoadingMock.mockImplementation((flag) =>
            flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                ? { value: false, isLoading: true }
                : { value: false, isLoading: false },
        )

        renderComponent()

        expect(
            screen.queryByText(
                /Opt in now for early access to the new AI Agent analytics experience\./,
            ),
        ).not.toBeInTheDocument()
    })

    it('logs a Segment event when the opt-in CTA is clicked', async () => {
        const { user } = renderComponent()

        await user.click(
            screen.getByRole('link', { name: /opt in to early access/i }),
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AnalyticsNewAutomateStatsOptInRequested,
        )
    })
})
