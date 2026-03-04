import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import { GorgiasChatIntegrationInstall } from './GorgiasChatIntegrationInstall'

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

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

    it('should render the legacy component when shouldShowRevampWhenAiAgentEnabled is false', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowRevampWhenAiAgentEnabled: false,
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
        mockUseFlag.mockImplementation((key) =>
            key === FeatureFlagKey.ChatSettingsScreensRevamp ? false : false,
        )
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: true,
            shouldShowRevampWhenAiAgentEnabled: true,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('old-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('new-revamp-install'),
        ).not.toBeInTheDocument()
    })

    it('should render the new revamp component when shouldShowRevampWhenAiAgentEnabled is true and ChatSettingsScreensRevamp flag is enabled', () => {
        mockUseFlag.mockImplementation((key) =>
            key === FeatureFlagKey.ChatSettingsScreensRevamp ? true : false,
        )
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: true,
            shouldShowRevampWhenAiAgentEnabled: true,
        })

        render(<GorgiasChatIntegrationInstall {...minProps} />)

        expect(screen.getByTestId('new-revamp-install')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-install')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('old-revamp-install'),
        ).not.toBeInTheDocument()
    })
})
