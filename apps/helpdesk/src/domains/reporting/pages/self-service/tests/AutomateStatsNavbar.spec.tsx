import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, render, userEvent } from '@repo/testing'
import { act } from '@testing-library/react'

import { Navigation } from 'components/Navigation/Navigation'
import { LINK_AI_SALES_AGENT_TEXT } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { AutomateStatsNavbar } from 'domains/reporting/pages/self-service/AutomateStatsNavbar'
import {
    AI_AGENT_AI_AGENT_NAV_TOOLTIP,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
} from 'domains/reporting/pages/self-service/constants'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useAppSelector } from 'hooks/useAppSelector'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { isTrialing } from 'state/currentAccount/selectors'

jest.mock('hooks/useAppSelector', () => ({ useAppSelector: jest.fn() }))
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent', () => ({
    useCanUseAiSalesAgent: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(),
}))

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockUseCanUseAiSalesAgent = assumeMock(useCanUseAiSalesAgent)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseStandaloneAiContext = assumeMock(useStandaloneAiContext)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('<AutomateStatsNavbar />', () => {
    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseCanUseAiSalesAgent.mockReturnValue(true)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseStandaloneAiContext.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
    })

    it('should render with upgrade icon when automate is not enabled', () => {
        mockUseAppSelector.mockImplementation(() => false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        const { getByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        expect(getByText('Overview')).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })

    it('should render the automate stats navbar with the correct items', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AIAgentStatsPage)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })

        mockUseAppSelector.mockImplementation(() => true)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        const { getAllByRole, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        const links = getAllByRole('link')

        expect(links[0]).toHaveAttribute('href', '/app/stats/ai-agent-overview')
        expect(links[0].textContent).toEqual('Overview')
        expect(links[1]).toHaveAttribute('href', '/app/stats/automate-ai-agent')
        expect(links[1].textContent).toEqual('AI Agent')
        expect(links[2]).toHaveAttribute(
            'href',
            '/app/stats/ai-sales-agent/overview',
        )
        expect(links[2].textContent).toEqual('Shopping Assistant')
        expect(links[3]).toHaveAttribute(
            'href',
            '/app/stats/performance-by-features',
        )
        expect(links[3].textContent).toEqual('Performance by feature')
    })

    it('should display the AI Sales Agent link as a normal link when account has a new automate plan', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getCurrentAutomatePlan) return { generation: 6 }
            if (selector === isTrialing) return false
            return undefined
        })

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
        const link = linkElement.closest('a')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            '/app/stats/ai-sales-agent/overview',
        )
        expect(link?.querySelector('i.material-icons')).not.toBeInTheDocument()
    })

    it('should display the AI Sales Agent link as a normal link when account is trialing', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getCurrentAutomatePlan) return { generation: 5 }
            if (selector === isTrialing) return true
            return undefined
        })

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
        const link = linkElement.closest('a')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            '/app/stats/ai-sales-agent/overview',
        )
        expect(link?.querySelector('i.material-icons')).not.toBeInTheDocument()
    })

    it('should display the AI Sales Agent link as a normal link when AI SALES AGENT trial is active', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getCurrentAutomatePlan) return { generation: 5 }
            if (selector === isTrialing) return false
            return undefined
        })

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
        const link = linkElement.closest('a')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            '/app/stats/ai-sales-agent/overview',
        )
        const upgradeIcon = link?.querySelector('i.material-icons')
        expect(upgradeIcon).toBeNull()
    })

    it('should display the AI Sales Agent link as a normal link when AiSalesAgentBypassPlanCheck flag is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiSalesAgentBypassPlanCheck)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getCurrentAutomatePlan) return { generation: 5 }
            if (selector === isTrialing) return false
            return undefined
        })

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
        const link = linkElement.closest('a')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            '/app/stats/ai-sales-agent/overview',
        )
        expect(link?.querySelector('i.material-icons')).not.toBeInTheDocument()
    })

    it('should hide Performance by feature link when standalone AI agent', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AIAgentStatsPage)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
        mockUseAppSelector.mockImplementation(() => true)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseStandaloneAiContext.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                statistics: { canRead: true, canWrite: true },
                userManagement: { canRead: true, canWrite: true },
            }),
        )

        const { queryByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        expect(
            queryByText(PAGE_TITLE_PERFORMANCE_BY_FEATURES),
        ).not.toBeInTheDocument()
    })

    it('should hide legacy items and show New tag when both flags are enabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
                return { value: true, isLoading: false }
            if (flag === FeatureFlagKey.AiAgentAnalyticsDisableLegacyReports)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getAllByRole, getAllByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI & Automation/i }))

        const hrefs = getAllByRole('link').map((l) => l.getAttribute('href'))
        expect(hrefs).not.toContain('/app/stats/ai-agent-overview')
        expect(hrefs).not.toContain('/app/stats/automate-ai-agent')
        expect(hrefs).not.toContain('/app/stats/ai-sales-agent/overview')
        expect(hrefs).not.toContain('/app/stats/performance-by-features')
        expect(hrefs).toContain('/app/stats/analytics-overview')
        expect(hrefs).toContain('/app/stats/analytics-ai-agent')

        expect(getAllByText('New')).toHaveLength(2)
    })

    it('should show Beta tag and keep legacy items when only AiAgentAnalyticsDashboardsNewScreens is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getAllByRole, getAllByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI & Automation/i }))

        const hrefs = getAllByRole('link').map((l) => l.getAttribute('href'))
        expect(hrefs).toContain('/app/stats/analytics-overview')
        expect(hrefs).toContain('/app/stats/analytics-ai-agent')
        expect(hrefs).toContain('/app/stats/ai-agent-overview')
        expect(hrefs).toContain('/app/stats/ai-sales-agent/overview')
        expect(hrefs).toContain('/app/stats/performance-by-features')

        expect(getAllByText('Beta')).toHaveLength(2)
    })

    it('should display the AI Sales Agent link as a paywall link when plan generation < 6 and no bypasses are active', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getCurrentAutomatePlan) return { generation: 5 }
            if (selector === isTrialing) return false
            return undefined
        })

        mockUseCanUseAiSalesAgent.mockReturnValue(false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { getByText, getByRole } = render(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
        const link = linkElement.closest('a')
        expect(link).toBeInTheDocument()
        expect(link?.querySelector('i.material-icons')).toHaveTextContent(
            'arrow_circle_up',
        )
    })

    describe('nav tooltip', () => {
        beforeEach(() => {
            jest.useFakeTimers()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('shows tooltip content on hover when AiAgentAnalyticsNavTooltip is enabled', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })

            mockUseFlagWithLoading.mockImplementation((flag) => {
                if (
                    flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                )
                    return { value: true, isLoading: false }
                if (flag === FeatureFlagKey.AiAgentAnalyticsNavTooltip)
                    return { value: true, isLoading: false }
                return { value: false, isLoading: false }
            })

            const { getAllByRole, getByRole, findByText } = render(
                <Navigation.Root>
                    <AutomateStatsNavbar />
                </Navigation.Root>,
            )

            await user.click(getByRole('button', { name: /AI & Automation/i }))

            const aiAgentLink = getAllByRole('link').find(
                (l) =>
                    l.getAttribute('href') === '/app/stats/analytics-ai-agent',
            )!
            await user.hover(aiAgentLink)

            await act(() => {
                jest.advanceTimersByTime(700)
            })

            expect(
                await findByText(AI_AGENT_AI_AGENT_NAV_TOOLTIP.body),
            ).toBeInTheDocument()
        })

        it('does not show tooltip content on hover when AiAgentAnalyticsNavTooltip is disabled', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })

            mockUseFlagWithLoading.mockImplementation((flag) => {
                if (
                    flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                )
                    return { value: true, isLoading: false }
                return { value: false, isLoading: false }
            })

            const { getAllByRole, getByRole, queryByText } = render(
                <Navigation.Root>
                    <AutomateStatsNavbar />
                </Navigation.Root>,
            )

            await user.click(getByRole('button', { name: /AI & Automation/i }))

            const aiAgentLink = getAllByRole('link').find(
                (l) =>
                    l.getAttribute('href') === '/app/stats/analytics-ai-agent',
            )!
            await user.hover(aiAgentLink)

            await act(() => {
                jest.advanceTimersByTime(700)
            })

            expect(
                queryByText(AI_AGENT_AI_AGENT_NAV_TOOLTIP.body),
            ).not.toBeInTheDocument()
        })
    })
})
