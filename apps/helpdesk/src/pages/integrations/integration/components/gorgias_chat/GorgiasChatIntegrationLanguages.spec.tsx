import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasChatIntegrationLanguages } from './GorgiasChatIntegrationLanguages'

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
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages',
    () => () => <div data-testid="legacy-languages" />,
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationLanguages',
    () => ({
        GorgiasChatIntegrationLanguagesRevamp: () => (
            <div data-testid="revamp-languages" />
        ),
    }),
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration', () => ({
    useStoreIntegration: () => ({ storeIntegration: undefined }),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/ChatSettingsLanguagesSkeleton',
    () => ({
        ChatSettingsLanguagesSkeleton: () => (
            <div data-testid="languages-skeleton" />
        ),
    }),
)

const mockUseShouldShowChatSettingsRevamp = jest.mocked(
    useShouldShowChatSettingsRevamp,
)

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

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('languages-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-languages')).not.toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
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

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('languages-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-languages')).not.toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
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

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('legacy-languages')).toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
    })

    it('should render the legacy component when flag is disabled but AI agent is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => ({
            value: key === FeatureFlagKey.ChatSettingsRevamp ? false : false,
            isLoading: false,
        }))
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('legacy-languages')).toBeInTheDocument()
        expect(screen.queryByTestId('revamp-languages')).not.toBeInTheDocument()
    })

    it('should render the revamp component when ChatSettingsRevamp is enabled and AI agent is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => ({
            value:
                key === FeatureFlagKey.ChatSettingsRevamp ||
                key === FeatureFlagKey.ChatSettingsScreensRevamp
                    ? true
                    : false,
            isLoading: false,
        }))
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: true,
            isLoading: false,
        })

        render(<GorgiasChatIntegrationLanguages {...minProps} />)

        expect(screen.getByTestId('revamp-languages')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-languages')).not.toBeInTheDocument()
    })
})
