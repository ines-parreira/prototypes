import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasAutomateChatIntegration } from './GorgiasAutomateChatIntegration'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        useShouldShowChatSettingsRevamp: jest.fn(),
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

const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

const minProps = {
    integration: fromJS({ id: 1 }),
}

describe('<GorgiasAutomateChatIntegration />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the skeleton while the hook is loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
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

    it('should render the skeleton while the integration id is not yet available', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
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

    it('should render the legacy component when shouldShowScreensRevampWhenAiAgentEnabled is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('legacy-automation')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-automation'),
        ).not.toBeInTheDocument()
    })

    it('should render the revamp component when shouldShowScreensRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampEnabled: true,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(<GorgiasAutomateChatIntegration {...minProps} />)

        expect(screen.getByTestId('revamp-automation')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-automation'),
        ).not.toBeInTheDocument()
    })
})
