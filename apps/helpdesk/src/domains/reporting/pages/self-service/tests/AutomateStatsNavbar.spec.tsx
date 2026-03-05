import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, userEvent } from '@repo/testing'

import { Navigation } from 'components/Navigation/Navigation'
import { LINK_AI_SALES_AGENT_TEXT } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { AutomateStatsNavbar } from 'domains/reporting/pages/self-service/AutomateStatsNavbar'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { isTrialing } from 'state/currentAccount/selectors'
import { renderWithRouter } from 'utils/testing'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent', () => ({
    useCanUseAiSalesAgent: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseFlag = assumeMock(useFlag)
const mockUseCanUseAiSalesAgent = assumeMock(useCanUseAiSalesAgent)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

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
        mockUseFlag.mockImplementation(() => false)
        mockUseCanUseAiSalesAgent.mockReturnValue(true)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    it('should render with upgrade icon when automate is not enabled', () => {
        mockUseAppSelector.mockImplementation(() => false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        const { getByText, getByRole } = renderWithRouter(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        expect(getByText('Overview')).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })

    it('should render the automate stats navbar with the correct items', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (
                flag === FeatureFlagKey.AiShoppingAssistantEnabled ||
                flag === FeatureFlagKey.AIAgentStatsPage
            )
                return true
            return false
        })

        mockUseAppSelector.mockImplementation(() => true)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        const { getAllByRole, getByRole } = renderWithRouter(
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

    it('should not display the AI Sales Agent link when AiShoppingAssistantEnabled flag is disabled', () => {
        // Set up mock for the parent component's hasAutomate check
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            return undefined
        })

        // Explicitly mock the AiShoppingAssistantEnabled flag to be false
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return false
            return false
        })

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const { queryByText, getByRole } = renderWithRouter(
            <Navigation.Root>
                <AutomateStatsNavbar />
            </Navigation.Root>,
        )

        userEvent.click(getByRole('button', { name: /AI Agent/i }))

        expect(queryByText(LINK_AI_SALES_AGENT_TEXT)).not.toBeInTheDocument()
    })

    it('should display the AI Sales Agent link as a normal link when AiShoppingAssistantEnabled flag is enabled and account has a new automate plan', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return true
            return false
        })

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

        const { getByText, getByRole } = renderWithRouter(
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
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return true
            return false
        })

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

        const { getByText, getByRole } = renderWithRouter(
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
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return true
            return false
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

        const { getByText, getByRole } = renderWithRouter(
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
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return true
            if (flag === FeatureFlagKey.AiSalesAgentBypassPlanCheck) return true
            return false
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

        const { getByText, getByRole } = renderWithRouter(
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

    it('should display the AI Sales Agent link as a paywall link when plan generation < 6 and no bypasses are active', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return true
            if (flag === FeatureFlagKey.AiSalesAgentBypassPlanCheck)
                return false
            return false
        })

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

        const { getByText, getByRole } = renderWithRouter(
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
})
