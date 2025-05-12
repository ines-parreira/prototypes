import React from 'react'

import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { LINK_AI_SALES_AGENT_TEXT } from 'pages/stats/automate/aiSalesAgent/constants'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import AutomateStatsNavbar from 'pages/stats/self-service/AutomateStatsNavbar'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { isTrialing } from 'state/currentAccount/selectors'
import { assumeMock, renderWithRouter } from 'utils/testing'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent', () => {
    const actualModule = jest.requireActual(
        'hooks/aiAgent/useCanUseAiSalesAgent',
    )
    return {
        ...actualModule,
        useAtLeastOneStoreHasActiveTrial: jest.fn(),
        useAtleastOneStoreHasActiveTrialOnSpecificStores: jest.fn(),
    }
})

const mockUseAtleastOneStoreHasActiveTrial = assumeMock(
    useAtLeastOneStoreHasActiveTrial,
)
const mockUseFlag = assumeMock(useFlag)

jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    }),
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('<AutomateStatsNavbar />', () => {
    const defaultProps = {
        commonNavLinkProps: {
            exact: true,
        },
    }

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: () => false,
        } as any)
        mockUseFlag.mockImplementation(() => false)
        mockUseAtleastOneStoreHasActiveTrial.mockReturnValue(false)
    })

    it('should render with upgrade icon when automate is not enabled', () => {
        mockUseAppSelector.mockImplementation(() => false)
        const { getByText } = renderWithRouter(
            <AutomateStatsNavbar {...defaultProps} />,
        )
        expect(getByText('Overview')).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })

    it('should render the automate stats navbar with the correct items', () => {
        mockFlags({
            [FeatureFlagKey.AIAgentStatsPage]: true,
        })

        mockUseAppSelector.mockImplementation(() => true)
        const { getAllByRole } = renderWithRouter(
            <AutomateStatsNavbar {...defaultProps} />,
        )

        const links = getAllByRole('link')

        expect(links[0]).toHaveAttribute('href', '/app/stats/automate-overview')
        expect(links[0].textContent).toEqual('Overview')
        expect(links[1]).toHaveAttribute('href', '/app/stats/automate-ai-agent')
        expect(links[1].textContent).toEqual('AI Agent')
        expect(links[2]).toHaveAttribute(
            'href',
            '/app/stats/performance-by-features',
        )
        expect(links[2].textContent).toEqual('Performance by feature')
    })

    describe('AiSalesAgentStatsLink', () => {
        beforeEach(() => {
            // Reset all mocks to default values
            mockUseAppSelector.mockImplementation(() => undefined)
            mockUseFlag.mockImplementation(() => false)

            mockFlags({
                [FeatureFlagKey.AIAgentStatsPage]: true,
            })
        })

        it('should not display the AI Sales Agent link when AiShoppingAssistantEnabled flag is disabled', () => {
            // Set up mock for the parent component's hasAutomate check
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                return undefined
            })

            // Explicitly mock the AiShoppingAssistantEnabled flag to be false
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return false
                return false
            })

            const { queryByText } = renderWithRouter(
                <AutomateStatsNavbar {...defaultProps} />,
            )

            expect(
                queryByText(LINK_AI_SALES_AGENT_TEXT),
            ).not.toBeInTheDocument()
        })

        it('should display the AI Sales Agent link as a normal link when AiShoppingAssistantEnabled flag is enabled and account has a new automate plan', () => {
            // Set up mocks for all the selectors and flags that the component will check
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                return false
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentAutomatePlan)
                    return { generation: 6 }
                if (selector === isTrialing) return false
                return undefined
            })

            const { getByText } = renderWithRouter(
                <AutomateStatsNavbar {...defaultProps} />,
            )

            const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
            const link = linkElement.closest('a')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                '/app/stats/ai-sales-agent/overview',
            )
            // Verify that the upgrade icon is NOT present for normal links
            expect(
                link?.querySelector('i.material-icons'),
            ).not.toBeInTheDocument()
        })

        it('should display the AI Sales Agent link as a normal link when account is trialing', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                return false
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                if (selector === isTrialing) return true
                return undefined
            })

            const { getByText } = renderWithRouter(
                <AutomateStatsNavbar {...defaultProps} />,
            )

            const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
            const link = linkElement.closest('a')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                '/app/stats/ai-sales-agent/overview',
            )
            // Verify that the upgrade icon is NOT present for normal links
            expect(
                link?.querySelector('i.material-icons'),
            ).not.toBeInTheDocument()
        })

        it('should display the AI Sales Agent link as a normal link when AI SALES AGENT trial is active', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                return false
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                if (selector === isTrialing) return false
                return undefined
            })

            mockUseAtleastOneStoreHasActiveTrial.mockReturnValue(true)

            const { getByText } = renderWithRouter(
                <AutomateStatsNavbar {...defaultProps} />,
            )

            const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
            const link = linkElement.closest('a')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                '/app/stats/ai-sales-agent/overview',
            )
            // Verify that the upgrade icon is NOT present for normal links
            expect(
                link?.querySelector('i.material-icons'),
            ).not.toBeInTheDocument()
        })

        it('should display the AI Sales Agent link as a normal link when AiSalesAgentBypassPlanCheck flag is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                if (flag === FeatureFlagKey.AiSalesAgentBypassPlanCheck)
                    return true
                return false
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                if (selector === isTrialing) return false
                return undefined
            })

            const { getByText } = renderWithRouter(
                <AutomateStatsNavbar {...defaultProps} />,
            )

            const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
            const link = linkElement.closest('a')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                '/app/stats/ai-sales-agent/overview',
            )
            // Verify that the upgrade icon is NOT present for normal links
            expect(
                link?.querySelector('i.material-icons'),
            ).not.toBeInTheDocument()
        })

        it('should display the AI Sales Agent link as a paywall link when plan generation < 6 and no bypasses are active', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                if (flag === FeatureFlagKey.AiSalesAgentBypassPlanCheck)
                    return false
                return false
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                if (selector === isTrialing) return false
                return undefined
            })

            const { getByText } = renderWithRouter(
                <AutomateStatsNavbar {...defaultProps} />,
            )

            const linkElement = getByText(LINK_AI_SALES_AGENT_TEXT)
            const link = linkElement.closest('a')
            expect(link).toBeInTheDocument()
            // Check for the upgrade icon which is characteristic of the paywall link
            expect(link?.querySelector('i.material-icons')).toHaveTextContent(
                'arrow_circle_up',
            )
        })
    })
})
