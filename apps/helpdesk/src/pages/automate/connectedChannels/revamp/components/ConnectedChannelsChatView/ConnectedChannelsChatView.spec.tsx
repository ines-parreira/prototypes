import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'

import { useArticleRecommendation } from '../../hooks/useArticleRecommendation'
import { useFlows } from '../../hooks/useFlows'
import { useOrderManagement } from '../../hooks/useOrderManagement'
import { ConnectedChannelsChatView } from './ConnectedChannelsChatView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopName: 'test-shop',
        shopType: 'shopify',
    })),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('../../hooks/useArticleRecommendation')
jest.mock('../../hooks/useFlows')
jest.mock('../../hooks/useOrderManagement')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ArticleRecommendationCard/ArticleRecommendationCard',
    () => ({
        ArticleRecommendationCard: () => <div>ArticleRecommendationCard</div>,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/FlowsCard/FlowsCard',
    () => ({
        FlowsCard: () => <div>FlowsCard</div>,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/OrderManagementCard/OrderManagementCard',
    () => ({
        OrderManagementCard: () => <div>OrderManagementCard</div>,
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

const mockChannel = {
    type: TicketChannel.Chat,
    value: { meta: { app_id: 'test-app-id' } },
} as any

const mockedUseSelfServiceChatChannels = jest.requireMock(
    'pages/automate/common/hooks/useSelfServiceChatChannels',
).default as jest.MockedFunction<() => unknown[]>

describe('ConnectedChannelsChatView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
            handleFlowAdd: jest.fn(),
            handleFlowRemove: jest.fn(),
            handleFlowReorder: jest.fn(),
        })
        mockedUseOrderManagement.mockReturnValue({
            enabledInSettings: true,
            isOrderManagementEnabled: false,
            isDisabled: false,
            isLoading: false,
            showStoreRequired: false,
            orderManagementUrl:
                '/app/settings/order-management/shopify/test-shop',
            handleToggle: jest.fn(),
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

        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

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
        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

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

        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

        expect(
            screen.queryByText('ArticleRecommendationCard'),
        ).not.toBeInTheDocument()
    })

    it('should render the order management card when enabledInSettings is true', () => {
        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

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

        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

        expect(
            screen.queryByText('OrderManagementCard'),
        ).not.toBeInTheDocument()
    })

    it('should render the flows card when channel is defined', () => {
        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

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
            handleFlowAdd: jest.fn(),
            handleFlowRemove: jest.fn(),
            handleFlowReorder: jest.fn(),
        })

        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

        expect(screen.queryByText('FlowsCard')).not.toBeInTheDocument()
    })
})
