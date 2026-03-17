import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { useIsAiAgentEnabled } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useIsAiAgentEnabled'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasChatIntegrationPreferences } from './GorgiasChatIntegrationPreferences'

jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useIsAiAgentEnabled',
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreferences/GorgiasChatIntegrationPreferences',
    () => () => <div data-testid="legacy-preferences" />,
)

const mockRevampPreferences = jest.fn()
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationPreferences',
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
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatSettingsPreferencesSkeleton',
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
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: true,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
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

    it('should render the legacy component when shouldShowScreensRevampWhenAiAgentEnabled is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: false,
            shouldShowScreensRevampWhenAiAgentEnabled: false,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(screen.getByTestId('legacy-preferences')).toBeInTheDocument()
        expect(
            screen.queryByTestId('revamp-preferences'),
        ).not.toBeInTheDocument()
    })

    it('should render the revamp component when shouldShowScreensRevampWhenAiAgentEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
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
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
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
            shouldShowRevampWhenAiAgentEnabled: true,
            shouldShowScreensRevampWhenAiAgentEnabled: true,
            isLoading: false,
            isChatSettingsRevampEnabled: false,
            isChatSettingsScreensRevampEnabled: false,
        })

        render(<GorgiasChatIntegrationPreferences {...minProps} />)

        expect(mockRevampPreferences).toHaveBeenCalledWith(
            expect.objectContaining({ isAiAgentEnabled: true }),
        )
    })
})
