import { render, screen } from '@testing-library/react'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { ReportOrderIssueFlowView } from '../ReportOrderIssueFlowView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store', shopType: 'shopify' }),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanel: jest.fn(() => ({
            showPreviewPanel: jest.fn(),
            chatPreviewPortal: null,
        })),
    }),
)

jest.mock(
    'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector',
    () => ({
        ChatChannelSelector: () => <div>ChatChannelSelector</div>,
    }),
)

jest.mock(
    '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
    () => ({
        OrderManagementFlowHeader: ({ title }: { title: string }) => (
            <div>
                <span>{title}</span>
            </div>
        ),
    }),
)

const mockUseSelfServiceChatChannels =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >
const mockUseChatPreviewPanel = useChatPreviewPanel as jest.MockedFunction<
    typeof useChatPreviewPanel
>

const mockChatChannel = {
    type: 'chat' as const,
    value: {
        id: 1,
        meta: {
            app_id: 'test-app-id',
            languages: [{ language: 'en', primary: true }],
        },
    },
} as any

describe('ReportOrderIssueFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the header with correct title', () => {
        render(<ReportOrderIssueFlowView />)

        expect(screen.getByText('Report order issue')).toBeInTheDocument()
    })

    it('should initialize the chat preview panel when channels are available', () => {
        const mockShowPreviewPanel = jest.fn()
        mockUseSelfServiceChatChannels.mockReturnValue([mockChatChannel])
        mockUseChatPreviewPanel.mockReturnValue({
            showPreviewPanel: mockShowPreviewPanel,
            chatPreviewPortal: null,
        } as any)

        render(<ReportOrderIssueFlowView />)

        expect(mockShowPreviewPanel).toHaveBeenCalledWith('test-app-id')
    })
})
