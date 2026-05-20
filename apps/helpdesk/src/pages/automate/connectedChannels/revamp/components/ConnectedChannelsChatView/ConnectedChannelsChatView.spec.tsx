import { render } from '@repo/testing'
import type { QueryObserverResult } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import type { Dictionary } from 'lodash'

import { TicketChannel } from 'business/types/ticket'
import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import type { Workflow } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/FlowsCard/types'

import { useArticleRecommendation } from '../../hooks/useArticleRecommendation'
import { useFlows } from '../../hooks/useFlows'
import { useOrderManagement } from '../../hooks/useOrderManagement'
import { ConnectedChannelsChatView } from './ConnectedChannelsChatView'

const renderComponent = () => render(<ConnectedChannelsChatView />)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopName: 'test-shop',
        shopType: 'shopify',
    })),
}))
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
    () => ({
        useChatPreviewChannelsContext: jest.fn().mockReturnValue({
            shopName: 'test-shop',
            selectedChannelId: undefined,
            setSelectedChannelId: jest.fn(),
        }),
    }),
)

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('../../hooks/useArticleRecommendation')
jest.mock('../../hooks/useFlows')
jest.mock('../../hooks/useOrderManagement')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: jest.fn(),
    }),
)
jest.mock('models/workflows/queries', () => ({
    useListWorkflowEntryPoints: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ArticleRecommendationCard/ArticleRecommendationCard',
    () => ({
        ArticleRecommendationCard: () => <div>ArticleRecommendationCard</div>,
    }),
)

const mockFlowsCardHandlers: {
    onAdd?: (updatedWorkflows: Workflow[]) => void
    onRemove?: (updatedWorkflows: Workflow[]) => void
    onReorder?: (updatedWorkflows: Workflow[]) => void
} = {}

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/FlowsCard/FlowsCard',
    () => ({
        FlowsCard: ({
            onAdd,
            onRemove,
            onReorder,
        }: {
            onAdd: (updatedWorkflows: Workflow[]) => void
            onRemove: (updatedWorkflows: Workflow[]) => void
            onReorder: (updatedWorkflows: Workflow[]) => void
        }) => {
            mockFlowsCardHandlers.onAdd = onAdd
            mockFlowsCardHandlers.onRemove = onRemove
            mockFlowsCardHandlers.onReorder = onReorder
            return <div>FlowsCard</div>
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/OrderManagementCard/OrderManagementCard',
    () => ({
        OrderManagementCard: ({
            onChange,
        }: {
            onChange: (value: boolean) => Promise<void>
        }) => {
            mockOrderManagementCardHandlers.onChange = onChange
            return <div>OrderManagementCard</div>
        },
    }),
)

jest.mock('../../../legacy/components/ConnectedChannelsEmptyView', () => ({
    ConnectedChannelsEmptyView: () => <div>ConnectedChannelsEmptyView</div>,
}))

const mockedUseArticleRecommendation =
    useArticleRecommendation as jest.MockedFunction<
        typeof useArticleRecommendation
    >

const mockedUseFlows = useFlows as jest.MockedFunction<typeof useFlows>

const mockedUseOrderManagement = useOrderManagement as jest.MockedFunction<
    typeof useOrderManagement
>

const mockedUseListWorkflowEntryPoints =
    useListWorkflowEntryPoints as jest.MockedFunction<
        typeof useListWorkflowEntryPoints
    >

const mockedUseChatPreviewPanelContext =
    useChatPreviewPanelContext as jest.MockedFunction<
        typeof useChatPreviewPanelContext
    >

const mockChannel = {
    type: TicketChannel.Chat,
    value: { meta: { app_id: 'test-app-id' } },
} as SelfServiceChatChannel

const mockedUseSelfServiceChatChannels = jest.requireMock(
    'pages/automate/common/hooks/useSelfServiceChatChannels',
).default as jest.MockedFunction<() => unknown[]>

const mockHandleFlowAdd = jest.fn()
const mockHandleFlowRemove = jest.fn()
const mockHandleFlowReorder = jest.fn()
const mockUpdateWorkflowEntryPoints = jest.fn()
const mockHandleOrderManagementToggle = jest.fn()
const mockReloadPreview = jest.fn()

const mockOrderManagementCardHandlers: {
    onChange?: (value: boolean) => Promise<void>
} = {}

describe('ConnectedChannelsChatView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseChatPreviewPanelContext.mockReturnValue({
            updateWorkflowEntryPoints: mockUpdateWorkflowEntryPoints,
            displayPage: jest.fn(),
            reloadPreview: mockReloadPreview,
        } as unknown as ReturnType<typeof useChatPreviewPanelContext>)
        mockedUseSelfServiceChatChannels.mockReturnValue([])
        mockedUseArticleRecommendation.mockReturnValue({
            hasChatChannels: true,
            enabledInSettings: true,
            isArticleRecommendationEnabled: false,
            isDisabled: false,
            isLoading: false,
            showHelpCenterRequired: false,
            handleToggle: jest.fn(),
        })
        mockedUseFlows.mockReturnValue({
            isLoading: false,
            channel: mockChannel,
            primaryLanguage: 'en',
            workflowEntrypoints: [],
            workflowConfigurations: [],
            automationSettingsWorkflows: [],
            handleFlowAdd: mockHandleFlowAdd,
            handleFlowRemove: mockHandleFlowRemove,
            handleFlowReorder: mockHandleFlowReorder,
        })
        mockedUseOrderManagement.mockReturnValue({
            enabledInSettings: true,
            isOrderManagementEnabled: false,
            isDisabled: false,
            isLoading: false,
            showStoreRequired: false,
            orderManagementUrl:
                '/app/settings/order-management/shopify/test-shop',
            handleToggle: mockHandleOrderManagementToggle,
        })
        mockedUseListWorkflowEntryPoints.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
            isError: true,
            isLoadingError: true,
            isRefetchError: false,
            isSuccess: false,
            status: 'error',
            dataUpdatedAt: 0,
            errorUpdatedAt: 0,
            failureCount: 0,
            failureReason: undefined,
            errorUpdateCount: 0,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: false,
            isInitialLoading: false,
            isPaused: false,
            isPlaceholderData: false,
            isPreviousData: false,
            isRefetching: false,
            isStale: false,
            refetch: function (): Promise<
                QueryObserverResult<Dictionary<string>, unknown>
            > {
                throw new Error('Function not implemented.')
            },
            remove: function (): void {
                throw new Error('Function not implemented.')
            },
            fetchStatus: 'fetching',
        })
    })

    it('should render the empty view when there are no chat channels', () => {
        mockedUseArticleRecommendation.mockReturnValue({
            hasChatChannels: false,
            enabledInSettings: true,
            isArticleRecommendationEnabled: false,
            isDisabled: false,
            isLoading: false,
            showHelpCenterRequired: false,
            handleToggle: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByText('ConnectedChannelsEmptyView'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('ArticleRecommendationCard'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('OrderManagementCard'),
        ).not.toBeInTheDocument()
    })

    it('should render the article recommendation card when enabledInSettings is true', () => {
        renderComponent()

        expect(
            screen.getByText('ArticleRecommendationCard'),
        ).toBeInTheDocument()
    })

    it('should not render the article recommendation card when enabledInSettings is false', () => {
        mockedUseArticleRecommendation.mockReturnValue({
            hasChatChannels: true,
            enabledInSettings: false,
            isArticleRecommendationEnabled: false,
            isDisabled: false,
            isLoading: false,
            showHelpCenterRequired: false,
            handleToggle: jest.fn(),
        })

        renderComponent()

        expect(
            screen.queryByText('ArticleRecommendationCard'),
        ).not.toBeInTheDocument()
    })

    it('should render the order management card when enabledInSettings is true', () => {
        renderComponent()

        expect(screen.getByText('OrderManagementCard')).toBeInTheDocument()
    })

    it('should not render the order management card when enabledInSettings is false', () => {
        mockedUseOrderManagement.mockReturnValue({
            enabledInSettings: false,
            isOrderManagementEnabled: false,
            isDisabled: false,
            isLoading: false,
            showStoreRequired: false,
            orderManagementUrl: '',
            handleToggle: jest.fn(),
        })

        renderComponent()

        expect(
            screen.queryByText('OrderManagementCard'),
        ).not.toBeInTheDocument()
    })

    it('should render the flows card when channel is defined', () => {
        renderComponent()

        expect(screen.getByText('FlowsCard')).toBeInTheDocument()
    })

    it('should not render the flows card when channel is undefined', () => {
        mockedUseFlows.mockReturnValue({
            isLoading: false,
            channel: undefined,
            primaryLanguage: 'en',
            workflowEntrypoints: [],
            workflowConfigurations: [],
            automationSettingsWorkflows: [],
            handleFlowAdd: mockHandleFlowAdd,
            handleFlowRemove: mockHandleFlowRemove,
            handleFlowReorder: mockHandleFlowReorder,
        })

        renderComponent()

        expect(screen.queryByText('FlowsCard')).not.toBeInTheDocument()
    })

    describe('flow handlers', () => {
        const nextEntrypoints = [
            { workflow_id: 'wf-1', enabled: true },
            { workflow_id: 'wf-2', enabled: true },
        ]

        it('should call handleFlowAdd with the given entrypoints when onAdd is triggered', async () => {
            renderComponent()

            await act(async () => {
                await mockFlowsCardHandlers.onAdd!(nextEntrypoints)
            })

            expect(mockHandleFlowAdd).toHaveBeenCalledWith(nextEntrypoints)
        })

        it('should call handleFlowRemove with the given entrypoints when onRemove is triggered', async () => {
            renderComponent()

            await act(async () => {
                await mockFlowsCardHandlers.onRemove!(nextEntrypoints)
            })

            expect(mockHandleFlowRemove).toHaveBeenCalledWith(nextEntrypoints)
        })

        it('should call handleFlowReorder with the given entrypoints when onReorder is triggered', async () => {
            renderComponent()

            await act(async () => {
                await mockFlowsCardHandlers.onReorder!(nextEntrypoints)
            })

            expect(mockHandleFlowReorder).toHaveBeenCalledWith(nextEntrypoints)
        })

        it('should call updateWorkflowEntryPoints with mapped flows once labels are loaded after onAdd', async () => {
            const entrypointLabels = {
                'wf-1': 'Flow One',
                'wf-2': 'Flow Two',
            }
            mockedUseFlows.mockReturnValue({
                isLoading: false,
                channel: mockChannel,
                primaryLanguage: 'en',
                workflowEntrypoints: [],
                workflowConfigurations: [],
                automationSettingsWorkflows: nextEntrypoints,
                handleFlowAdd: mockHandleFlowAdd,
                handleFlowRemove: mockHandleFlowRemove,
                handleFlowReorder: mockHandleFlowReorder,
            })
            mockedUseListWorkflowEntryPoints.mockReturnValue({
                data: entrypointLabels,
                isLoading: false,
            } as unknown as ReturnType<typeof useListWorkflowEntryPoints>)

            renderComponent()

            await act(async () => {
                await mockFlowsCardHandlers.onAdd!(nextEntrypoints)
            })

            await waitFor(() => {
                expect(mockUpdateWorkflowEntryPoints).toHaveBeenCalledWith([
                    {
                        workflow_id: 'wf-1',
                        language: 'en',
                        label: 'Flow One',
                    },
                    {
                        workflow_id: 'wf-2',
                        language: 'en',
                        label: 'Flow Two',
                    },
                ])
            })
        })

        it('should filter out flows without a matching label from updateWorkflowEntryPoints', async () => {
            const entrypointLabels = {
                'wf-1': 'Flow One',
            }
            mockedUseFlows.mockReturnValue({
                isLoading: false,
                channel: mockChannel,
                primaryLanguage: 'en',
                workflowEntrypoints: [],
                workflowConfigurations: [],
                automationSettingsWorkflows: nextEntrypoints,
                handleFlowAdd: mockHandleFlowAdd,
                handleFlowRemove: mockHandleFlowRemove,
                handleFlowReorder: mockHandleFlowReorder,
            })
            mockedUseListWorkflowEntryPoints.mockReturnValue({
                data: entrypointLabels,
                isLoading: false,
            } as unknown as ReturnType<typeof useListWorkflowEntryPoints>)

            renderComponent()

            await act(async () => {
                await mockFlowsCardHandlers.onAdd!(nextEntrypoints)
            })

            await waitFor(() => {
                expect(mockUpdateWorkflowEntryPoints).toHaveBeenCalledWith([
                    {
                        workflow_id: 'wf-1',
                        language: 'en',
                        label: 'Flow One',
                    },
                ])
            })
        })

        it('should not call updateWorkflowEntryPoints while entry point labels are still loading', async () => {
            mockedUseListWorkflowEntryPoints.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as unknown as ReturnType<typeof useListWorkflowEntryPoints>)

            renderComponent()

            await act(async () => {
                await mockFlowsCardHandlers.onAdd!(nextEntrypoints)
            })

            expect(mockUpdateWorkflowEntryPoints).not.toHaveBeenCalled()
        })
    })

    describe('onOrderManagementChange', () => {
        it('should call handleOrderManagementToggle with true when onChange is triggered with true', async () => {
            mockHandleOrderManagementToggle.mockResolvedValue(undefined)

            renderComponent()

            await act(async () => {
                await mockOrderManagementCardHandlers.onChange!(true)
            })

            expect(mockHandleOrderManagementToggle).toHaveBeenCalledWith(true)
        })

        it('should call handleOrderManagementToggle with false when onChange is triggered with false', async () => {
            mockHandleOrderManagementToggle.mockResolvedValue(undefined)

            renderComponent()

            await act(async () => {
                await mockOrderManagementCardHandlers.onChange!(false)
            })

            expect(mockHandleOrderManagementToggle).toHaveBeenCalledWith(false)
        })

        it('should call reloadPreview after handleOrderManagementToggle resolves', async () => {
            const callOrder: string[] = []
            mockHandleOrderManagementToggle.mockImplementation(async () => {
                callOrder.push('handleToggle')
            })
            mockReloadPreview.mockImplementation(() => {
                callOrder.push('reloadPreview')
            })

            renderComponent()

            await act(async () => {
                await mockOrderManagementCardHandlers.onChange!(true)
            })

            expect(callOrder).toEqual(['handleToggle', 'reloadPreview'])
        })

        it('should not call reloadPreview if handleOrderManagementToggle has not resolved yet', async () => {
            let resolveToggle!: () => void
            mockHandleOrderManagementToggle.mockReturnValue(
                new Promise<void>((resolve) => {
                    resolveToggle = resolve
                }),
            )

            renderComponent()

            const changePromise =
                mockOrderManagementCardHandlers.onChange!(true)

            expect(mockReloadPreview).not.toHaveBeenCalled()

            await act(async () => {
                resolveToggle()
                await changePromise
            })

            expect(mockReloadPreview).toHaveBeenCalledTimes(1)
        })
    })
})
