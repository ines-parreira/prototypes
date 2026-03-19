import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatTranslateText } from './GorgiasChatTranslateText'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/components/ChatSettingsTranslateTextSkeleton',
    () => ({
        ChatSettingsTranslateTextSkeleton: () => (
            <div data-testid="translate-text-skeleton" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/GorgiasChatIntegrationTranslateText',
    () => ({
        GorgiasChatIntegrationTranslateTextRevamp: () => (
            <div data-testid="revamp-translate-text" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText',
    () => ({
        __esModule: true,
        default: () => <div data-testid="legacy-translate-text" />,
    }),
)

const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

const mockUseStoreIntegration = useStoreIntegration as jest.MockedFunction<
    typeof useStoreIntegration
>

describe('<GorgiasChatTranslateText />', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })
    })

    it('should render the skeleton while the revamp hooks are loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: true,
        })

        render(<GorgiasChatTranslateText integration={fromJS({ id: 1 })} />)

        expect(
            screen.getByTestId('translate-text-skeleton'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-translate-text'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-translate-text'),
        ).not.toBeInTheDocument()
    })

    it('should render the skeleton when the integration id is not yet available', () => {
        render(<GorgiasChatTranslateText integration={fromJS({})} />)

        expect(
            screen.getByTestId('translate-text-skeleton'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-translate-text'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-translate-text'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is false', () => {
        render(<GorgiasChatTranslateText integration={fromJS({ id: 1 })} />)

        expect(screen.getByTestId('legacy-translate-text')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-translate-text'),
        ).not.toBeInTheDocument()
    })

    it('should render the revamp component when shouldShowRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampEnabled: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
        })

        render(<GorgiasChatTranslateText integration={fromJS({ id: 1 })} />)

        expect(screen.getByTestId('revamp-translate-text')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-translate-text'),
        ).not.toBeInTheDocument()
    })
})
