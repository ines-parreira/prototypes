import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { CancelOrderFlowView } from '../CancelOrderFlowView'
import { useCancelOrderFlow } from '../hooks/useCancelOrderFlow'
import { buildCancelOrderSimulationMessages } from '../utils/buildCancelOrderSimulationMessages'

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
            displayPage: jest.fn(),
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

    describe('onChatPreviewLoaded effect', () => {
        let mockUpdateQuickReplies: jest.Mock
        let mockSetConversationMessages: jest.Mock
        let mockDisplayPage: jest.Mock
        let mockOnChatPreviewLoaded: jest.Mock
        let mockCleanup: jest.Mock

        beforeEach(() => {
            mockUpdateQuickReplies = jest.fn()
            mockSetConversationMessages = jest.fn()
            mockDisplayPage = jest.fn()
            mockCleanup = jest.fn()
            mockOnChatPreviewLoaded = jest.fn().mockReturnValue(mockCleanup)

            mockUseChatPreviewPanelContext.mockReturnValue({
                updateQuickReplies: mockUpdateQuickReplies,
                setConversationMessages: mockSetConversationMessages,
                onChatPreviewLoaded: mockOnChatPreviewLoaded,
                displayPage: mockDisplayPage,
            } as any)
        })

        it('should subscribe with fireIfAlreadyLoaded=true on mount', () => {
            render(<CancelOrderFlowView />)

            expect(mockOnChatPreviewLoaded).toHaveBeenCalledWith(
                expect.any(Function),
                true,
            )
        })

        it('should unsubscribe the callback on unmount', () => {
            const { unmount } = render(<CancelOrderFlowView />)

            unmount()

            expect(mockCleanup).toHaveBeenCalled()
        })

        it('should set conversation messages from the second effect on mount', () => {
            render(<CancelOrderFlowView />)

            const expectedMessages = buildCancelOrderSimulationMessages(
                defaultHookReturn.responseMessageContent,
            )
            expect(mockSetConversationMessages).toHaveBeenCalledWith(
                expectedMessages,
            )
        })

        it('should update conversation messages when responseMessageContent changes', () => {
            const updatedContent = {
                html: '<p>Your order has been cancelled.</p>',
                text: 'Your order has been cancelled.',
            }

            const { rerender } = render(<CancelOrderFlowView />)

            mockUseCancelOrderFlow.mockReturnValue({
                ...defaultHookReturn,
                responseMessageContent: updatedContent,
            } as any)

            rerender(<CancelOrderFlowView />)

            const expectedMessages =
                buildCancelOrderSimulationMessages(updatedContent)
            expect(mockSetConversationMessages).toHaveBeenLastCalledWith(
                expectedMessages,
            )
        })

        describe('when the chat preview finishes loading', () => {
            beforeEach(() => {
                mockOnChatPreviewLoaded = jest
                    .fn()
                    .mockImplementation((callback: () => void) => {
                        callback()
                        return mockCleanup
                    })

                mockUseChatPreviewPanelContext.mockReturnValue({
                    updateQuickReplies: mockUpdateQuickReplies,
                    setConversationMessages: mockSetConversationMessages,
                    onChatPreviewLoaded: mockOnChatPreviewLoaded,
                    displayPage: mockDisplayPage,
                } as any)
            })

            it('should disable quick replies', () => {
                render(<CancelOrderFlowView />)

                expect(mockUpdateQuickReplies).toHaveBeenCalledWith({
                    enabled: false,
                    replies: [],
                })
            })

            it('should set the simulation conversation messages', () => {
                render(<CancelOrderFlowView />)

                const expectedMessages = buildCancelOrderSimulationMessages(
                    defaultHookReturn.responseMessageContent,
                )
                expect(mockSetConversationMessages).toHaveBeenCalledWith(
                    expectedMessages,
                )
            })

            it('should navigate to the conversation page', () => {
                render(<CancelOrderFlowView />)

                expect(mockDisplayPage).toHaveBeenCalledWith('conversation')
            })
        })
    })
})
