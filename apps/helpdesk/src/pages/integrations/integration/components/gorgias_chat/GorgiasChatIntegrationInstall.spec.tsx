import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatIntegrationInstall } from './GorgiasChatIntegrationInstall'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall',
    () => () => <div data-testid="legacy-install" />,
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/GorgiasChatIntegrationInstall',
    () => ({
        GorgiasChatIntegrationInstallRevamp: () => (
            <div data-testid="new-revamp-install" />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/ChatSettingsInstallationSkeleton',
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
            shouldShowRevampForNonAiAgent: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
        })
    })

    it('should render the skeleton while the revamp hooks are loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowRevampForNonAiAgent: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: true,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('installation-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
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
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is false', () => {
        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('legacy-install')).toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the new revamp component when shouldShowRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowRevampForNonAiAgent: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('new-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
    })
})
