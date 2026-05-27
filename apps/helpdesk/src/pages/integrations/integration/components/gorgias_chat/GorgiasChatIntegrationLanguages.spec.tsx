import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatIntegrationLanguages } from './GorgiasChatIntegrationLanguages'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages',
    () => () => <div data-testid="legacy-languages" />,
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/GorgiasChatIntegrationLanguages',
    () => ({
        GorgiasChatIntegrationLanguagesRevamp: () => (
            <div data-testid="revamp-languages" />
        ),
    }),
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/ChatSettingsLanguagesSkeleton',
    () => ({
        ChatSettingsLanguagesSkeleton: () => (
            <div data-testid="languages-skeleton" />
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

describe('<GorgiasChatIntegrationLanguages />', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
            shouldShowChatSettingsRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            shouldShowNonAiAgentRevamp: false,
        })
    })

    it('should render the skeleton while the revamp hooks are loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
            shouldShowChatSettingsRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: true,
            shouldShowNonAiAgentRevamp: false,
        })

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('languages-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-languages')).not.toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
    })

    it('should render the skeleton when the integration id is not yet available', () => {
        render(
            <GorgiasChatIntegrationLanguages
                {...minProps}
                integration={fromJS({})}
            />,
        )

        expect(screen.getByTestId('languages-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-languages')).not.toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowChatSettingsRevamp is false', () => {
        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('legacy-languages')).toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
    })

    it('should render the revamp component when shouldShowChatSettingsRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
            shouldShowChatSettingsRevamp: true,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            shouldShowNonAiAgentRevamp: false,
        })

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('revamp-languages')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-languages')).not.toBeInTheDocument()
    })
})
