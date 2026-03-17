import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatIntegrationInstall } from './GorgiasChatIntegrationInstall'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall',
    () => () => <div data-testid="legacy-install" />,
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall',
    () => ({
        GorgiasChatIntegrationInstallRevamp: () => (
            <div data-testid="new-revamp-install" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall',
    () => () => <div data-testid="old-revamp-install" />,
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/ChatSettingsInstallationSkeleton',
    () => ({
        ChatSettingsInstallationSkeleton: () => (
            <div data-testid="installation-skeleton" />
        ),
    }),
)

const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >

const mockUseStoreIntegration = useStoreIntegration as jest.MockedFunction<
    typeof useStoreIntegration
>

const minProps = {
    integration: fromJS({ id: 1 }),
    actions: {
        updateOrCreateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
        createGorgiasChatIntegration: jest.fn(),
    } as any,
    loading: fromJS({}),
    isUpdate: false,
    currentUser: fromJS({}),
}

describe('<GorgiasChatIntegrationInstall />', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })
    })

    it('should render the skeleton while the revamp hooks are loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: true,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('installation-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the skeleton while the integration id is not yet available', () => {
        render(
            <GorgiasChatIntegrationInstall
                {...minProps}
                integration={fromJS({})}
            />,
        )

        expect(screen.getByTestId('installation-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is false', () => {
        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('legacy-install')).toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the old revamp component when shouldShowRevampWhenAiAgentEnabled is true but shouldShowScreensRevampWhenAiAgentEnabled is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('old-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the new revamp component when shouldShowScreensRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('new-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
    })
})
