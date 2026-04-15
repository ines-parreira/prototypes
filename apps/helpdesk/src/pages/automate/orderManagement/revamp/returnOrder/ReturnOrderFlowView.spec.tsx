import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { useReturnOrderFlow } from './hooks/useReturnOrderFlow'
import { ReturnOrderFlowView } from './ReturnOrderFlowView'

const mockHandleSave = jest.fn()
const mockHandleReset = jest.fn()
const mockHandleEligibilityChange = jest.fn()
const mockHandleActionChange = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store' }),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('./hooks/useReturnOrderFlow')

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

const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>
const mockUseReturnOrderFlow = useReturnOrderFlow as jest.MockedFunction<
    typeof useReturnOrderFlow
>

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
    '../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
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

jest.mock('./components/ReturnOrderEligibility', () => ({
    ReturnOrderEligibility: ({
        onChange,
    }: {
        onChange: (e?: { key: string; value: string; operator: string }) => void
    }) => (
        <div>
            <span>ReturnOrderEligibility</span>
            <button
                onClick={() =>
                    onChange({
                        key: 'order_created_at',
                        value: '10',
                        operator: 'lt',
                    })
                }
            >
                Change eligibility
            </button>
        </div>
    ),
}))

jest.mock('./components/ReturnOrderAction', () => ({
    ReturnOrderAction: ({
        onChange,
    }: {
        onChange: (action: Record<string, unknown>) => void
    }) => (
        <div>
            <span>ReturnOrderAction</span>
            <button
                onClick={() =>
                    onChange({
                        type: ReturnActionType.LoopReturns,
                        integrationId: 1,
                    })
                }
            >
                Change action
            </button>
        </div>
    ),
}))

const defaultHookReturn = {
    isLoading: false,
    isUpdatePending: false,
    isDirty: false,
    storeIntegration: { id: 1, name: 'my-store' } as any,
    eligibility: { key: 'order_delivered_at', value: '30', operator: 'lt' },
    action: {
        type: ReturnActionType.AutomatedResponse as const,
        responseMessageContent: { html: '', text: '' },
    },
    handleEligibilityChange: mockHandleEligibilityChange,
    handleActionChange: mockHandleActionChange,
    handleSave: mockHandleSave,
    handleReset: mockHandleReset,
}

describe('ReturnOrderFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseReturnOrderFlow.mockReturnValue(defaultHookReturn)
    })

    it('should render the heading and child components when loaded', () => {
        render(<ReturnOrderFlowView />)

        expect(
            screen.getByText(
                'Allow customers to request a return if an order was delivered.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('ReturnOrderEligibility')).toBeInTheDocument()
        expect(screen.getByText('ReturnOrderAction')).toBeInTheDocument()
    })

    it('should render the header with correct title', () => {
        render(<ReturnOrderFlowView />)

        expect(screen.getByText('Return order')).toBeInTheDocument()
    })

    it('should have save disabled when not dirty', () => {
        render(<ReturnOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable save when dirty', () => {
        mockUseReturnOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
        })

        render(<ReturnOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    })

    it('should have save disabled when update is pending', () => {
        mockUseReturnOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
            isUpdatePending: true,
        })

        render(<ReturnOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should call handleSave on save click', async () => {
        const user = userEvent.setup()
        mockUseReturnOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
        })

        render(<ReturnOrderFlowView />)

        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockHandleSave).toHaveBeenCalled()
    })

    it('should call handleEligibilityChange when eligibility changes', async () => {
        const user = userEvent.setup()
        render(<ReturnOrderFlowView />)

        await user.click(
            screen.getByRole('button', { name: 'Change eligibility' }),
        )

        expect(mockHandleEligibilityChange).toHaveBeenCalledWith({
            key: 'order_created_at',
            value: '10',
            operator: 'lt',
        })
    })

    it('should call handleActionChange when action changes', async () => {
        const user = userEvent.setup()
        render(<ReturnOrderFlowView />)

        await user.click(screen.getByRole('button', { name: 'Change action' }))

        expect(mockHandleActionChange).toHaveBeenCalledWith({
            type: ReturnActionType.LoopReturns,
            integrationId: 1,
        })
    })

    it('should show skeleton when loading', () => {
        mockUseReturnOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isLoading: true,
        })

        render(<ReturnOrderFlowView />)

        expect(
            screen.queryByText(
                'Allow customers to request a return if an order was delivered.',
            ),
        ).not.toBeInTheDocument()
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

        render(<ReturnOrderFlowView />)

        expect(mockShowPreviewPanel).toHaveBeenCalledWith('test-app-id')
    })

    it('should not render ReturnOrderAction when no AI agent access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        render(<ReturnOrderFlowView />)

        expect(screen.queryByText('ReturnOrderAction')).not.toBeInTheDocument()
        expect(screen.getByText('ReturnOrderEligibility')).toBeInTheDocument()
    })

    it('should disable quick replies on mount', () => {
        render(<ReturnOrderFlowView />)

        const { updateQuickReplies } =
            mockUseChatPreviewPanel.mock.results[0].value
        expect(updateQuickReplies).toHaveBeenCalledWith({
            enabled: false,
            replies: [],
        })
    })

    it('should call setConversationMessages with only the customer message when response text is empty', () => {
        render(<ReturnOrderFlowView />)

        const { setConversationMessages } =
            mockUseChatPreviewPanel.mock.results[0].value
        expect(setConversationMessages).toHaveBeenCalledWith([
            expect.objectContaining({ fromAgent: false, isHtml: true }),
        ])
    })

    it('should call setConversationMessages with both customer and agent messages when response text is non-empty', () => {
        mockUseReturnOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            action: {
                type: ReturnActionType.AutomatedResponse as const,
                responseMessageContent: {
                    html: '<p>Your return has been processed.</p>',
                    text: 'Your return has been processed.',
                },
            },
        })

        render(<ReturnOrderFlowView />)

        const { setConversationMessages } =
            mockUseChatPreviewPanel.mock.results[0].value
        expect(setConversationMessages).toHaveBeenCalledWith([
            expect.objectContaining({ fromAgent: false, isHtml: true }),
            expect.objectContaining({
                fromAgent: true,
                isHtml: true,
                text: '<p>Your return has been processed.</p>',
            }),
        ])
    })

    it('should call setConversationMessages with only the customer message when action is LoopReturns', () => {
        mockUseReturnOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            action: {
                type: ReturnActionType.LoopReturns as const,
                integrationId: 1,
            },
        })

        render(<ReturnOrderFlowView />)

        const { setConversationMessages } =
            mockUseChatPreviewPanel.mock.results[0].value
        expect(setConversationMessages).toHaveBeenCalledWith([
            expect.objectContaining({ fromAgent: false, isHtml: true }),
        ])
    })
})
