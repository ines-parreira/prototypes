import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { useIsAiAgentEnabled } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useIsAiAgentEnabled'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasChatIntegrationPreferences } from './GorgiasChatIntegrationPreferences'

jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useIsAiAgentEnabled',
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreferences/GorgiasChatIntegrationPreferences',
    () => () => <div data-testid="legacy-preferences" />,
)

const mockRevampPreferences = jest.fn()
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/GorgiasChatIntegrationPreferences',
    () => ({
        GorgiasChatIntegrationPreferencesRevamp: (props: any) => {
            mockRevampPreferences(props)
            return <div data-testid="revamp-preferences" />
        },
    }),
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration', () => ({
    useStoreIntegration: () => ({ storeIntegration: undefined }),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/ChatSettingsPreferencesSkeleton',
    () => ({
        ChatSettingsPreferencesSkeleton: () => (
            <div data-testid="preferences-skeleton" />
        ),
    }),
)

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >
const mockUseIsAiAgentEnabled = useIsAiAgentEnabled as jest.MockedFunction<
    typeof useIsAiAgentEnabled
>

const minProps = {
    integration: fromJS({ id: 1 }),
    actions: {
        updateOrCreateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
    } as any,
    loading: fromJS({}),
    currentUser: fromJS({}),
    articleRecommendationEnabled: false,
    selfServiceConfiguration: null,
    selfServiceConfigurationEnabled: false,
}

const mockIntegrationsLoading = fromJS({ updateIntegration: false })

beforeEach(() => {
    jest.resetAllMocks()
    mockUseAppSelector.mockReturnValue(mockIntegrationsLoading)
    mockUseIsAiAgentEnabled.mockReturnValue({
        isAiAgentEnabled: false,
        isLoading: false,
    })
})

describe('<GorgiasChatIntegrationPreferences />', () => {
    it('should render the skeleton while revamp hooks are loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowChatSettingsRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: true,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(screen.getByTestId('preferences-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-preferences'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-preferences'),
        ).not.toBeInTheDocument()
    })

    it('should render the skeleton while the integration id is not yet available', () => {
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
        })

        render(
            <GorgiasChatIntegrationPreferences
                {...minProps}
                integration={fromJS({})}
            />,
        )

        expect(screen.getByTestId('preferences-skeleton')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-preferences'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-preferences'),
        ).not.toBeInTheDocument()
    })

    it('should render the legacy component when shouldShowChatSettingsRevamp is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowChatSettingsRevamp: false,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(screen.getByTestId('legacy-preferences')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-preferences'),
        ).not.toBeInTheDocument()
    })

    it('should render the revamp component when shouldShowChatSettingsRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowChatSettingsRevamp: true,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(screen.getByTestId('revamp-preferences')).toBeInTheDocument()
        expect(
            screen.queryByTestId('legacy-preferences'),
        ).not.toBeInTheDocument()
    })

    it('should pass integrationsLoading to the revamp component', () => {
        const integrationsLoading = fromJS({ updateIntegration: 1 })
        mockUseAppSelector.mockReturnValue(integrationsLoading)
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowChatSettingsRevamp: true,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(mockRevampPreferences).toHaveBeenCalledWith(
            expect.objectContaining({ loading: integrationsLoading }),
        )
    })

    it('should pass isAiAgentEnabled to the revamp component', () => {
        mockUseIsAiAgentEnabled.mockReturnValue({
            isAiAgentEnabled: true,
            isLoading: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowChatSettingsRevamp: true,
            shouldShowFlowsScreensRevamp: false,
            shouldShowOrderManagementScreensRevamp: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampFlowsEnabled: false,
            isChatSettingsScreensRevampOrderManagementEnabled: false,
            isNonAiAgentChat2RevampEnabled: false,
            shouldShowNonAiAgentChatSettingsRevamp: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(mockRevampPreferences).toHaveBeenCalledWith(
            expect.objectContaining({ isAiAgentEnabled: true }),
        )
    })
})
