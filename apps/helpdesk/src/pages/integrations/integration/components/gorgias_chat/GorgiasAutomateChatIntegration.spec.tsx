import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasAutomateChatIntegration } from './GorgiasAutomateChatIntegration'

jest.mock('@repo/feature-flags')
const mockUseFlagWithLoading = useFlagWithLoading as jest.MockedFunction<
    typeof useFlagWithLoading
>

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        __esModule: true,
        default: jest.fn(),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasAutomateChatIntegration',
    () => ({
        GorgiasAutomateChatIntegration: () => (
            <div data-testid="legacy-automation" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasAutomateChatIntegration',
    () => ({
        GorgiasAutomateChatIntegrationRevamp: () => (
            <div data-testid="revamp-automation" />
        ),
    }),
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration', () => ({
    useStoreIntegration: () => ({ storeIntegration: undefined }),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsAutomationSkeleton',
    () => ({
        ChatSettingsAutomationSkeleton: () => (
            <div data-testid="automation-skeleton" />
        ),
    }),
)

const mockUseShouldShowChatSettingsRevamp = jest.mocked(
    useShouldShowChatSettingsRevamp,
)

const minProps = {
    integration: fromJS({ id: 1 }),
}

describe('<GorgiasAutomateChatIntegration />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the skeleton while the feature flag is loading', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('automation-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-automation'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-automation'),
        ).not.toBeInTheDocument()
    })

    it('should render the skeleton while the integration id is not yet available', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(
            <GorgiasAutomateChatIntegration
                {...minProps}
                integration={fromJS({})}
            />,
        )

        expect(screen.getByTestId('automation-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-automation'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-automation'),
        ).not.toBeInTheDocument()
    })

    it('should render the skeleton while the store configuration is loading', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: true,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('automation-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-automation'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-automation'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is false', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('legacy-automation')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-automation'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is true and ChatSettingsScreensRevamp flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => ({
            value:
                key === FeatureFlagKey.ChatSettingsScreensRevamp
                    ? false
                    : false,
            isLoading: false,
        }))
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: true,
            shouldShowRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('legacy-automation')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-automation'),
        ).not.toBeInTheDocument()
    })

    it('should render the revamp component when shouldShowRevampWhenAiAgentEnabled is true and ChatSettingsScreensRevamp flag is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => ({
            value:
                key === FeatureFlagKey.ChatSettingsScreensRevamp ? true : false,
            isLoading: false,
        }))
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: true,
            shouldShowRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('revamp-automation')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-automation'),
        ).not.toBeInTheDocument()
    })
})
