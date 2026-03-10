import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasChatIntegrationInstall } from './GorgiasChatIntegrationInstall'

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

jest.mock('pages/integrations/integration/hooks/useStoreIntegration', () => ({
    useStoreIntegration: () => ({ storeIntegration: undefined }),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/ChatSettingsInstallationSkeleton',
    () => ({
        ChatSettingsInstallationSkeleton: () => (
            <div data-testid="installation-skeleton" />
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

describe('<GorgiasChatIntegrationInstall />', () => {
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

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('legacy-install')).toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the old revamp component when shouldShowRevampWhenAiAgentEnabled is true but ChatSettingsScreensRevamp flag is disabled', () => {
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

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('old-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the new revamp component when shouldShowRevampWhenAiAgentEnabled is true and ChatSettingsScreensRevamp flag is enabled', () => {
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

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('new-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
    })
})
