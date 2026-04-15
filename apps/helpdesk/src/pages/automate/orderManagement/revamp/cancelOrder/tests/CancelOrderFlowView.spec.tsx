import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { CancelOrderFlowView } from '../CancelOrderFlowView'
import { useCancelOrderFlow } from '../hooks/useCancelOrderFlow'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store', shopType: 'shopify' }),
}))

jest.mock('../hooks/useCancelOrderFlow')

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
            setConversationMessages: jest.fn(),
            updateQuickReplies: jest.fn(),
        })),
    }),
)

jest.mock(
    'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector',
    () => ({
        ChatChannelSelector: () => <div>ChatChannelSelector</div>,
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

jest.mock(
    '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
    () => ({
        OrderManagementFlowHeader: ({
            title,
            onSave,
            isSaveDisabled,
        }: {
            title: string
            onSave: () => void
            isSaveDisabled: boolean
        }) => (
            <div>
                <span>{title}</span>
                <button onClick={onSave} disabled={isSaveDisabled}>
                    Save
                </button>
            </div>
        ),
    }),
)

jest.mock('../components/CancelOrderConfiguration', () => ({
    CancelOrderConfiguration: () => <div>CancelOrderConfiguration</div>,
}))

const mockHandleSave = jest.fn()

const mockUseCancelOrderFlow = useCancelOrderFlow as jest.MockedFunction<
    typeof useCancelOrderFlow
>

const defaultHookReturn = {
    isLoading: false,
    isUpdatePending: false,
    isDirty: false,
    storeIntegration: { id: 1, name: 'my-store' } as any,
    eligibility: undefined,
    responseMessageContent: { html: '', text: '' },
    handleEligibilityChange: jest.fn(),
    handleResponseMessageChange: jest.fn(),
    handleSave: mockHandleSave,
    handleReset: jest.fn(),
}

describe('CancelOrderFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCancelOrderFlow.mockReturnValue(defaultHookReturn as any)
    })

    it('should render the header with correct title', () => {
        render(<CancelOrderFlowView />)

        expect(screen.getByText('Cancel order')).toBeInTheDocument()
    })

    it('should render the configuration component', () => {
        render(<CancelOrderFlowView />)

        expect(screen.getByText('CancelOrderConfiguration')).toBeInTheDocument()
    })

    it('should have save disabled when not dirty', () => {
        render(<CancelOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable save when dirty', () => {
        mockUseCancelOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
            eligibility: {
                key: 'order_created_at',
                value: '10',
                operator: 'lt',
            },
        })

        render(<CancelOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    })

    it('should have save disabled when update is pending', () => {
        mockUseCancelOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
            isUpdatePending: true,
            eligibility: {
                key: 'order_created_at',
                value: '10',
                operator: 'lt',
            },
        })

        render(<CancelOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should initialize the chat preview panel when channels are available', () => {
        const mockShowPreviewPanel = jest.fn()
        mockUseSelfServiceChatChannels.mockReturnValue([mockChatChannel])
        mockUseChatPreviewPanel.mockReturnValue({
            showPreviewPanel: mockShowPreviewPanel,
            chatPreviewPortal: null,
            setConversationMessages: jest.fn(),
            updateQuickReplies: jest.fn(),
        } as any)

        render(<CancelOrderFlowView />)

        expect(mockShowPreviewPanel).toHaveBeenCalledWith('test-app-id')
    })

    it('should call setConversationMessages with only the customer message when response text is empty', () => {
        render(<CancelOrderFlowView />)

        const { setConversationMessages } =
            mockUseChatPreviewPanel.mock.results[0].value
        expect(setConversationMessages).toHaveBeenCalledWith([
            expect.objectContaining({ fromAgent: false, isHtml: true }),
        ])
    })

    it('should call setConversationMessages with both customer and agent messages when response text is non-empty', () => {
        mockUseCancelOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            eligibility: {
                key: 'order_created_at',
                value: '10',
                operator: 'lt',
            },
            responseMessageContent: {
                html: '<p>Your order has been cancelled.</p>',
                text: 'Your order has been cancelled.',
            },
        })

        render(<CancelOrderFlowView />)

        const { setConversationMessages } =
            mockUseChatPreviewPanel.mock.results[0].value
        expect(setConversationMessages).toHaveBeenCalledWith([
            expect.objectContaining({ fromAgent: false, isHtml: true }),
            expect.objectContaining({
                fromAgent: true,
                isHtml: true,
                text: '<p>Your order has been cancelled.</p>',
            }),
        ])
    })

    it('should call handleSave on save click', async () => {
        const user = userEvent.setup()
        mockUseCancelOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
            eligibility: {
                key: 'order_created_at',
                value: '10',
                operator: 'lt',
            },
        })

        render(<CancelOrderFlowView />)

        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockHandleSave).toHaveBeenCalled()
    })
})
