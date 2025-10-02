import { FeatureFlagKey } from '@repo/feature-flags'
import { render, RenderResult } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'

import { AiAgentTaskSection } from '../AiAgentTaskSection'

jest.mock('core/flags')
jest.mock('pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled')
jest.mock('../../PendingTasksSection/PendingTasksSectionConnected', () => ({
    PendingTasksSectionConnected: () => (
        <div data-testid="mocked-pending-tasks">
            Mocked PendingTasksSectionConnected
        </div>
    ),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseAiAgentOverviewModeEnabled =
    useAiAgentOverviewModeEnabled as jest.MockedFunction<
        typeof useAiAgentOverviewModeEnabled
    >

const renderComponent = (): RenderResult => {
    return render(
        <AiAgentTaskSection shopName="test-shop" shopType="shopify" />,
    )
}

describe('AiAgentTaskSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render anything when loading', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentPostOnboardingSteps,
        )
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: false,
            isLoading: true,
        })

        const { queryByText, queryByTestId } = renderComponent()

        expect(
            queryByText('Skeleton for AI Agent Post Onboarding Steps'),
        ).not.toBeInTheDocument()
        expect(queryByTestId('mocked-pending-tasks')).not.toBeInTheDocument()
    })

    it('should render post onboarding when mode is disabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentPostOnboardingSteps,
        )
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: false,
            isLoading: false,
        })

        const { queryByText } = renderComponent()

        expect(
            queryByText('Skeleton for AI Agent Post Onboarding Steps'),
        ).toBeInTheDocument()
        expect(
            queryByText('Mocked PendingTasksSectionConnected'),
        ).not.toBeInTheDocument()
    })

    it('should render post store installation when flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentPostStoreInstallationSteps,
        )
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })

        const { queryByText } = renderComponent()

        expect(
            queryByText('Skeleton for AI Agent Post Store Installation Steps'),
        ).toBeInTheDocument()
        expect(
            queryByText('Mocked PendingTasksSectionConnected'),
        ).not.toBeInTheDocument()
    })

    it('should render PendingTasksSectionConnected by default when no feature flags are enabled', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })

        const { getByTestId } = renderComponent()

        expect(getByTestId('mocked-pending-tasks')).toBeInTheDocument()
    })
})
