import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasAutomateChatIntegrationRevamp } from '../GorgiasAutomateChatIntegration'
import { useArticleRecommendation } from '../hooks/useArticleRecommendation'
import { useFlows } from '../hooks/useFlows'
import { useOrderManagement } from '../hooks/useOrderManagement'

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')
const mockUseStoreIntegration = jest.mocked(useStoreIntegration)

jest.mock('../hooks/useArticleRecommendation')
const mockUseArticleRecommendation = jest.mocked(useArticleRecommendation)

jest.mock('../hooks/useOrderManagement')
const mockUseOrderManagement = jest.mocked(useOrderManagement)

jest.mock('../hooks/useFlows')
const mockUseFlows = jest.mocked(useFlows)

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
const mockUseApplicationsAutomationSettings = jest.mocked(
    useApplicationsAutomationSettings,
)

const mockHandleChatApplicationAutomationSettingsUpdate = jest.fn()

jest.mock('../GorgiasChatRevampLayout', () => ({
    GorgiasChatRevampLayout: ({
        children,
        onSave,
        isSaveDisabled,
        isSaving,
    }: {
        children: React.ReactNode
        onSave?: () => void
        isSaveDisabled?: boolean
        isSaving?: boolean
    }) => (
        <div data-testid="revamp-layout">
            <button
                onClick={onSave}
                disabled={isSaveDisabled || isSaving}
                aria-label="Save"
            >
                Save
            </button>
            {children}
        </div>
    ),
}))

jest.mock(
    '../components/ArticleRecommendationCard/ArticleRecommendationCard',
    () => ({
        ArticleRecommendationCard: ({
            isEnabled,
            onChange,
        }: {
            isEnabled: boolean
            onChange: (value: boolean) => void
        }) => (
            <div data-testid="article-recommendation-card">
                <button
                    onClick={() => onChange(!isEnabled)}
                    aria-label={`Article Recommendation: ${isEnabled ? 'on' : 'off'}`}
                >
                    Toggle
                </button>
            </div>
        ),
    }),
)

jest.mock('../components/OrderManagementCard/OrderManagementCard', () => ({
    OrderManagementCard: ({
        isEnabled,
        onChange,
    }: {
        isEnabled: boolean
        onChange: (value: boolean) => void
    }) => (
        <div data-testid="order-management-card">
            <button
                onClick={() => onChange(!isEnabled)}
                aria-label={`Order Management: ${isEnabled ? 'on' : 'off'}`}
            >
                Toggle
            </button>
        </div>
    ),
}))

jest.mock(
    '../components/ConnectedChannelsEmptyView/ConnectedChannelsEmptyView',
    () => ({
        ConnectedChannelsEmptyView: () => (
            <div data-testid="connected-channels-empty-view" />
        ),
    }),
)
jest.mock('../components/FlowsCard/FlowsCard', () => ({
    FlowsCard: ({
        onChange,
    }: {
        automationSettingsWorkflows: {
            workflow_id: string
            enabled: boolean
        }[]
        onChange: (
            workflows: { workflow_id: string; enabled: boolean }[],
            action: 'add' | 'remove' | 'reorder',
        ) => void
    }) => (
        <div data-testid="flows-card">
            <button
                onClick={() =>
                    onChange([{ workflow_id: 'wf-1', enabled: true }], 'add')
                }
                aria-label="Add Flow"
            >
                Add Flow
            </button>
        </div>
    ),
}))

jest.mock(
    '../components/GorgiasChatCreationWizard/components/SaveChangesPrompt',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useGorgiasChatCreationWizardContext: () => ({
            resetPreview: jest.fn(),
        }),
    }),
)

const defaultServerSettings = {
    id: 1,
    applicationId: 123,
    articleRecommendation: { enabled: false },
    orderManagement: { enabled: false },
    workflows: { enabled: false },
    createdDatetime: '',
    updatedDatetime: '',
}

const defaultArticleRecommendationHookReturn = {
    enabledInSettings: true,
    isArticleRecommendationEnabled: false,
    isDisabled: false,
    isLoading: false,
    showHelpCenterRequired: false,
    handleToggle: jest.fn(),
}

const defaultOrderManagementHookReturn = {
    enabledInSettings: true,
    isOrderManagementEnabled: false,
    isDisabled: false,
    isLoading: false,
    showStoreRequired: false,
    orderManagementUrl: '/app/settings/order-management/shopify/test-shop',
    handleToggle: jest.fn(),
}

const defaultFlowsHookReturn = {
    isLoading: false,
    shopName: 'test-shop',
    shopType: 'shopify',
    channel: {
        type: TicketChannel.Chat,
        value: { id: 1, meta: {} },
    },
    primaryLanguage: 'en-US',
    workflowEntrypoints: [],
    workflowConfigurations: [],
    automationSettingsWorkflows: [],
}

const defaultProps = {
    integration: fromJS({ id: 1, meta: { app_id: 'app-123' } }),
}

describe('<GorgiasAutomateChatIntegrationRevamp />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: true,
            isConnectedToShopify: false,
        })
        mockUseArticleRecommendation.mockReturnValue(
            defaultArticleRecommendationHookReturn,
        )
        mockUseOrderManagement.mockReturnValue(defaultOrderManagementHookReturn)
        mockUseFlows.mockReturnValue(defaultFlowsHookReturn as any)
        mockUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'app-123': defaultServerSettings,
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        })
    })

    it('should render within the revamp layout', () => {
        render(
            <MemoryRouter>
                <GorgiasAutomateChatIntegrationRevamp {...defaultProps} />
            </MemoryRouter>,
        )

        expect(screen.getByTestId('revamp-layout')).toBeInTheDocument()
    })

    it('should render article recommendation card when enabledInSettings is true', () => {
        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.getByTestId('article-recommendation-card'),
        ).toBeInTheDocument()
    })

    it('should not render article recommendation card when enabledInSettings is false', () => {
        mockUseArticleRecommendation.mockReturnValue({
            ...defaultArticleRecommendationHookReturn,
            enabledInSettings: false,
        })

        render(
            <MemoryRouter>
                <GorgiasAutomateChatIntegrationRevamp {...defaultProps} />
            </MemoryRouter>,
        )

        expect(
            screen.queryByTestId('article-recommendation-card'),
        ).not.toBeInTheDocument()
    })

    it('should render order management card when enabledInSettings is true', () => {
        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(screen.getByTestId('order-management-card')).toBeInTheDocument()
    })

    it('should not render order management card when enabledInSettings is false', () => {
        mockUseOrderManagement.mockReturnValue({
            ...defaultOrderManagementHookReturn,
            enabledInSettings: false,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.queryByTestId('order-management-card'),
        ).not.toBeInTheDocument()
    })

    it('should render empty view within layout when no store is connected', () => {
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(screen.getByTestId('revamp-layout')).toBeInTheDocument()
        expect(
            screen.getByTestId('connected-channels-empty-view'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('order-management-card'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('article-recommendation-card'),
        ).not.toBeInTheDocument()
    })

    describe('deferred save behavior', () => {
        it('should disable the Save button when no changes have been made', () => {
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        })

        it('should enable the Save button after toggling Order Management', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )

            expect(
                screen.getByRole('button', { name: 'Save' }),
            ).not.toBeDisabled()
        })

        it('should enable the Save button after toggling Article Recommendation', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Article Recommendation: off',
                }),
            )

            expect(
                screen.getByRole('button', { name: 'Save' }),
            ).not.toBeDisabled()
        })

        it('should not call the API when toggling Order Management (before Save)', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).not.toHaveBeenCalled()
        })

        it('should not call the API when toggling Article Recommendation (before Save)', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Article Recommendation: off',
                }),
            )

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).not.toHaveBeenCalled()
        })

        it('should call the API with pending Order Management value on Save', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderManagement: { enabled: true },
                }),
            )
        })

        it('should call the API with pending Article Recommendation value on Save', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Article Recommendation: off',
                }),
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    articleRecommendation: { enabled: true },
                }),
            )
        })

        it('should save both pending changes in a single API call', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )
            await user.click(
                screen.getByRole('button', {
                    name: 'Article Recommendation: off',
                }),
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).toHaveBeenCalledTimes(1)
            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderManagement: { enabled: true },
                    articleRecommendation: { enabled: true },
                }),
            )
        })

        it('should reflect the toggled value in the card immediately (optimistic UI)', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: 'Order Management: off' }),
            ).toBeInTheDocument()

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )

            expect(
                screen.getByRole('button', { name: 'Order Management: on' }),
            ).toBeInTheDocument()
        })

        it('should enable the Save button after changing flows', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(screen.getByRole('button', { name: 'Add Flow' }))

            expect(
                screen.getByRole('button', { name: 'Save' }),
            ).not.toBeDisabled()
        })

        it('should not call the API when changing flows (before Save)', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(screen.getByRole('button', { name: 'Add Flow' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).not.toHaveBeenCalled()
        })

        it('should call the API with pending flows value on Save', async () => {
            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(screen.getByRole('button', { name: 'Add Flow' }))
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    workflows: expect.objectContaining({
                        entrypoints: [{ workflow_id: 'wf-1', enabled: true }],
                    }),
                }),
            )
        })

        it('should not call API when no serverSettings available', async () => {
            mockUseApplicationsAutomationSettings.mockReturnValue({
                applicationsAutomationSettings: {},
                isFetchPending: false,
                isUpdatePending: false,
                handleChatApplicationAutomationSettingsUpdate:
                    mockHandleChatApplicationAutomationSettingsUpdate,
            })

            const user = userEvent.setup()
            render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).not.toHaveBeenCalled()
        })

        it('should not call API when integration has no app_id', async () => {
            const user = userEvent.setup()
            render(
                <GorgiasAutomateChatIntegrationRevamp
                    integration={fromJS({ id: 1 })}
                />,
            )

            await user.click(
                screen.getByRole('button', {
                    name: 'Order Management: off',
                }),
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(
                mockHandleChatApplicationAutomationSettingsUpdate,
            ).not.toHaveBeenCalled()
        })
    })
})
