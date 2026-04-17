import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { CancelOrderFlowView } from '../CancelOrderFlowView'
import { useCancelOrderFlow } from '../hooks/useCancelOrderFlow'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store', shopType: 'shopify' }),
}))

jest.mock('../hooks/useCancelOrderFlow')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
)

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
const mockUseChatPreviewPanelContext =
    useChatPreviewPanelContext as jest.MockedFunction<
        typeof useChatPreviewPanelContext
    >

const defaultHookReturn = {
    isLoading: false,
    isUpdatePending: false,
    isDirty: false,
    eligibility: undefined,
    responseMessageContent: { html: '', text: '' },
    handleEligibilityChange: jest.fn(),
    handleResponseMessageChange: jest.fn(),
    handleSave: mockHandleSave,
}

describe('CancelOrderFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCancelOrderFlow.mockReturnValue(defaultHookReturn as any)
        mockUseChatPreviewPanelContext.mockReturnValue({
            updateQuickReplies: jest.fn(),
            setConversationMessages: jest.fn(),
            onChatPreviewLoaded: jest.fn(),
        } as any)
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
        } as any)

        render(<CancelOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    })

    it('should have save disabled when update is pending', () => {
        mockUseCancelOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
            isUpdatePending: true,
        } as any)

        render(<CancelOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should call handleSave on save click', async () => {
        const user = userEvent.setup()
        mockUseCancelOrderFlow.mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
        } as any)

        render(<CancelOrderFlowView />)

        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockHandleSave).toHaveBeenCalled()
    })
})
