import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { Tab } from '../../types'
import { GorgiasChatIntegration } from './GorgiasChatIntegration'
import useIsQuickRepliesEnabled from './legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'
import useSelfServiceConfiguration from './legacy/hooks/useSelfServiceConfiguration'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('@repo/routing', () => ({
    history: { replace: jest.fn() },
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        ...jest.requireActual(
            'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
        ),
        useChatPreviewPanel: jest.fn(),
    }),
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock('pages/integrations/integration/hooks/useStoreIntegration')
jest.mock(
    './legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled',
)
jest.mock('./legacy/hooks/useSelfServiceConfiguration')

jest.mock('pages/ErrorBoundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

jest.mock('./GorgiasChatCreationWizard', () => ({
    GorgiasChatCreationWizard: () => <div data-testid="creation-wizard" />,
}))

jest.mock('./GorgiasChatIntegrationAppearance', () => ({
    GorgiasChatIntegrationAppearance: () => (
        <div data-testid="appearance-tab" />
    ),
}))

jest.mock('./GorgiasChatIntegrationInstall', () => ({
    GorgiasChatIntegrationInstall: () => <div data-testid="installation-tab" />,
}))

jest.mock('./GorgiasChatIntegrationLanguages', () => ({
    GorgiasChatIntegrationLanguages: () => <div data-testid="languages-tab" />,
}))

jest.mock('./GorgiasChatIntegrationList', () => ({
    GorgiasChatIntegrationList: () => <div data-testid="integration-list" />,
}))

jest.mock('./GorgiasChatIntegrationPreferences', () => ({
    GorgiasChatIntegrationPreferences: () => (
        <div data-testid="preferences-tab" />
    ),
}))

jest.mock('./GorgiasAutomateChatIntegration', () => ({
    GorgiasAutomateChatIntegration: () => <div data-testid="automate-tab" />,
}))

jest.mock(
    './legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText',
    () => () => <div data-testid="translate-text" />,
)

jest.mock(
    './legacy/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns',
    () => () => <div data-testid="campaigns-tab" />,
)

jest.mock(
    './legacy/GorgiasChatIntegrationQuickReplies/GorgiasChatIntegrationQuickReplies',
    () => () => <div data-testid="quick-replies-tab" />,
)

const mockUseParams = useParams as jest.Mock
const mockUseAiAgentAccess = useAiAgentAccess as jest.Mock
const mockUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.Mock
const mockUseChatPreviewPanel = useChatPreviewPanel as jest.Mock
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.Mock
const mockUseStoreIntegration = useStoreIntegration as jest.Mock
const mockUseIsQuickRepliesEnabled = useIsQuickRepliesEnabled as jest.Mock
const mockUseSelfServiceConfiguration = useSelfServiceConfiguration as jest.Mock

const mockShowPreviewPanel = jest.fn()
const mockHidePreviewPanel = jest.fn()

const defaultProps = {
    actions: {} as any,
    currentUser: fromJS({}),
    integration: fromJS({ id: 1, meta: { app_id: 'app-123' } }),
    integrationsProp: fromJS([]),
    loading: fromJS({}),
    isUpdate: false,
}

beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({
        integrationId: '1',
        extra: Tab.Appearance,
        subId: undefined,
    })

    mockUseAiAgentAccess.mockReturnValue({ hasAccess: false })
    mockUseApplicationsAutomationSettings.mockReturnValue({
        applicationsAutomationSettings: {},
    })
    mockUseChatPreviewPanel.mockReturnValue({
        showPreviewPanel: mockShowPreviewPanel,
        hidePreviewPanel: mockHidePreviewPanel,
        chatPreviewPortal: null,
        updateMainColor: jest.fn(),
        updatePosition: jest.fn(),
        updateHeaderPictureUrl: jest.fn(),
    })
    mockUseShouldShowChatSettingsRevamp.mockReturnValue({
        shouldShowScreensRevampWhenAiAgentEnabled: false,
    })
    mockUseStoreIntegration.mockReturnValue({ storeIntegration: undefined })
    mockUseIsQuickRepliesEnabled.mockReturnValue(false)
    mockUseSelfServiceConfiguration.mockReturnValue({
        selfServiceConfiguration: null,
        selfServiceConfigurationEnabled: false,
    })
})

describe('<GorgiasChatIntegration />', () => {
    it('renders the integration list when integrationId is not set', () => {
        mockUseParams.mockReturnValue({
            integrationId: undefined,
            extra: undefined,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('integration-list')).toBeInTheDocument()
    })

    it('renders the appearance tab for Tab.Appearance', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Appearance,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('appearance-tab')).toBeInTheDocument()
    })

    it('renders GorgiasTranslateText for Tab.Appearance with a subId', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Appearance,
            subId: 'some-sub-id',
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('translate-text')).toBeInTheDocument()
        expect(screen.queryByTestId('appearance-tab')).not.toBeInTheDocument()
    })

    it('renders the installation tab for Tab.Installation', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Installation,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('installation-tab')).toBeInTheDocument()
    })

    it('renders the preferences tab for Tab.Preferences', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Preferences,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('preferences-tab')).toBeInTheDocument()
    })

    it('renders the quick replies tab when Tab.QuickReplies and isQuickRepliesEnabled is true', () => {
        mockUseIsQuickRepliesEnabled.mockReturnValue(true)
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.QuickReplies,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('quick-replies-tab')).toBeInTheDocument()
    })

    it('renders the integration list when Tab.QuickReplies and isQuickRepliesEnabled is false', () => {
        mockUseIsQuickRepliesEnabled.mockReturnValue(false)
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.QuickReplies,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(
            screen.queryByTestId('quick-replies-tab'),
        ).not.toBeInTheDocument()
        expect(screen.getByTestId('integration-list')).toBeInTheDocument()
    })

    it('renders the campaigns tab for Tab.Campaigns', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Campaigns,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('campaigns-tab')).toBeInTheDocument()
    })

    it('renders the languages tab for Tab.Languages', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Languages,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('languages-tab')).toBeInTheDocument()
    })

    it('renders GorgiasTranslateText for Tab.Languages with a subId', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Languages,
            subId: 'some-sub-id',
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('translate-text')).toBeInTheDocument()
        expect(screen.queryByTestId('languages-tab')).not.toBeInTheDocument()
    })

    it('renders the automate tab for Tab.Automate', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Automate,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('automate-tab')).toBeInTheDocument()
    })

    it('renders the creation wizard for Tab.CreateWizard', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.CreateWizard,
            subId: undefined,
        })

        render(<GorgiasChatIntegration {...defaultProps} />)

        expect(screen.getByTestId('creation-wizard')).toBeInTheDocument()
    })

    describe('preview panel', () => {
        beforeEach(() => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowScreensRevampWhenAiAgentEnabled: true,
            })
        })

        it('calls showPreviewPanel for Tab.Appearance when revamp is enabled', () => {
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: Tab.Appearance,
                subId: undefined,
            })

            render(<GorgiasChatIntegration {...defaultProps} />)

            expect(mockShowPreviewPanel).toHaveBeenCalledWith('app-123')
        })

        it('calls hidePreviewPanel for Tab.Languages when revamp is enabled', () => {
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: Tab.Languages,
                subId: undefined,
            })

            render(<GorgiasChatIntegration {...defaultProps} />)

            expect(mockHidePreviewPanel).toHaveBeenCalled()
            expect(mockShowPreviewPanel).not.toHaveBeenCalled()
        })

        it('calls hidePreviewPanel for Tab.Installation when revamp is enabled', () => {
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: Tab.Installation,
                subId: undefined,
            })

            render(<GorgiasChatIntegration {...defaultProps} />)

            expect(mockHidePreviewPanel).toHaveBeenCalled()
            expect(mockShowPreviewPanel).not.toHaveBeenCalled()
        })

        it('calls showPreviewPanel for Tab.Preferences when revamp is enabled', () => {
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: Tab.Preferences,
                subId: undefined,
            })

            render(<GorgiasChatIntegration {...defaultProps} />)

            expect(mockShowPreviewPanel).toHaveBeenCalledWith('app-123')
        })

        it('does not call showPreviewPanel when revamp is disabled', () => {
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowScreensRevampWhenAiAgentEnabled: false,
            })
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: Tab.Appearance,
                subId: undefined,
            })

            render(<GorgiasChatIntegration {...defaultProps} />)

            expect(mockShowPreviewPanel).not.toHaveBeenCalled()
            expect(mockHidePreviewPanel).not.toHaveBeenCalled()
        })

        it('calls hidePreviewPanel when extra is undefined and revamp is enabled', () => {
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: undefined,
                subId: undefined,
            })

            render(<GorgiasChatIntegration {...defaultProps} />)

            expect(mockHidePreviewPanel).toHaveBeenCalled()
            expect(mockShowPreviewPanel).not.toHaveBeenCalled()
        })

        it('calls hidePreviewPanel on unmount', () => {
            mockUseParams.mockReturnValue({
                integrationId: '1',
                extra: Tab.Appearance,
                subId: undefined,
            })

            const { unmount } = render(
                <GorgiasChatIntegration {...defaultProps} />,
            )

            mockHidePreviewPanel.mockClear()

            unmount()

            expect(mockHidePreviewPanel).toHaveBeenCalledTimes(1)
        })
    })

    it('computes articleRecommendationEnabled as false when integration has no appId', () => {
        mockUseParams.mockReturnValue({
            integrationId: '1',
            extra: Tab.Preferences,
            subId: undefined,
        })

        render(
            <GorgiasChatIntegration
                {...defaultProps}
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getByTestId('preferences-tab')).toBeInTheDocument()
    })
})
