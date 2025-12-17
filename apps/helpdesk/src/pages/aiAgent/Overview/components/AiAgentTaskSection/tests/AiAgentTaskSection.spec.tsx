import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { RenderResult } from '@testing-library/react'
import { render, screen } from '@testing-library/react'

import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'

import { AiAgentTaskSection } from '../AiAgentTaskSection'

jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled')
jest.mock(
    '../../PostOnboardingTasksSection/PostOnboardingTasksSection',
    () => ({
        PostOnboardingTasksSection: () => (
            <div data-testid="post-onboarding-tasks">
                Post Onboarding Tasks Section
            </div>
        ),
    }),
)
jest.mock('../../PendingTasksSection/PendingTasksSectionConnected', () => ({
    PendingTasksSectionConnected: () => (
        <div data-testid="pending-tasks">Pending Tasks Section Connected</div>
    ),
}))

jest.mock('../../SetupTasksSection/SetupTaskSection', () => ({
    SetupTaskSection: () => (
        <div data-testid="mocked-setup-tasks">
            Skeleton for AI Agent Post Store Installation Steps
        </div>
    ),
}))
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseAiAgentOverviewModeEnabled =
    useAiAgentOverviewModeEnabled as jest.MockedFunction<
        typeof useAiAgentOverviewModeEnabled
    >

const renderComponent = (
    props?: Partial<{
        shopName: string
        shopType: string
        setIsAiAgentPostLive: jest.Mock
    }>,
): RenderResult => {
    const defaultProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        setIsAiAgentPostLive: jest.fn(),
    }

    return render(<AiAgentTaskSection {...defaultProps} {...props} />)
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

        renderComponent()

        expect(
            screen.queryByTestId('post-onboarding-tasks'),
        ).not.toBeInTheDocument()
        expect(screen.queryByTestId('pending-tasks')).not.toBeInTheDocument()
    })

    it('should render post onboarding tasks when mode is disabled and flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentPostOnboardingSteps,
        )
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: false,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByTestId('post-onboarding-tasks')).toBeInTheDocument()
        expect(screen.queryByTestId('pending-tasks')).not.toBeInTheDocument()
    })

    it('should render post store installation skeleton when that flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentPostStoreInstallationSteps,
        )
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })

        renderComponent()

        expect(
            screen.getByText(
                'Skeleton for AI Agent Post Store Installation Steps',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByTestId('pending-tasks')).not.toBeInTheDocument()
    })

    it('should render PendingTasksSectionConnected by default when no feature flags are enabled', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByTestId('pending-tasks')).toBeInTheDocument()
    })

    it('should call setIsAiAgentPostLive in useEffect with the correct value', () => {
        const mockSetIsAiAgentPostLive = jest.fn()

        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentPostOnboardingSteps,
        )
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: false,
            isLoading: false,
        })

        renderComponent({ setIsAiAgentPostLive: mockSetIsAiAgentPostLive })

        expect(mockSetIsAiAgentPostLive).toHaveBeenCalledWith(false)
        mockSetIsAiAgentPostLive.mockClear()

        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })

        renderComponent({ setIsAiAgentPostLive: mockSetIsAiAgentPostLive })

        expect(mockSetIsAiAgentPostLive).toHaveBeenCalledWith(true)
    })

    it('should not call setIsAiAgentPostLive when loading', () => {
        const mockSetIsAiAgentPostLive = jest.fn()

        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: null,
            isLoading: true,
        })

        renderComponent({ setIsAiAgentPostLive: mockSetIsAiAgentPostLive })

        expect(mockSetIsAiAgentPostLive).not.toHaveBeenCalled()
    })
})
