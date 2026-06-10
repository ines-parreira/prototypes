import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatbotCard } from './ChatbotCard'

const mockUpdateDisplayBotLabel = jest.fn()
const mockSetConversationMessages = jest.fn()
const mockOnChatPreviewLoaded = jest.fn(
    (callback: () => void, fireIfAlreadyLoaded?: boolean) => {
        if (fireIfAlreadyLoaded) {
            callback()
        }
        return jest.fn()
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: () => ({
            updateDisplayBotLabel: mockUpdateDisplayBotLabel,
            setConversationMessages: mockSetConversationMessages,
            onChatPreviewLoaded: mockOnChatPreviewLoaded,
        }),
    }),
)

describe('ChatbotCard', () => {
    const defaultProps = {
        displayBotLabel: true,
        onDisplayBotLabelChange: jest.fn(),
    }

    const renderComponent = (props = {}) =>
        render(<ChatbotCard {...defaultProps} {...props} />)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Chatbot heading and description', () => {
        renderComponent()

        expect(screen.getByText('Chatbot')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Control how automated messages are presented to shoppers/,
            ),
        ).toBeInTheDocument()
    })

    it('renders the toggle label', () => {
        renderComponent()

        expect(
            screen.getByText(
                /Display .Bot. next to chat title for automated messages/,
            ),
        ).toBeInTheDocument()
    })

    it('reflects the displayBotLabel prop on the toggle', () => {
        renderComponent({ displayBotLabel: false })

        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('calls onDisplayBotLabelChange when the toggle is clicked', async () => {
        const user = userEvent.setup()
        const onDisplayBotLabelChange = jest.fn()
        renderComponent({ onDisplayBotLabelChange })

        await user.click(screen.getByRole('switch'))

        expect(onDisplayBotLabelChange).toHaveBeenCalledWith(false)
    })

    it('calls updateDisplayBotLabel when the toggle is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('switch'))

        expect(mockUpdateDisplayBotLabel).toHaveBeenCalledWith(false)
    })

    it('seeds a bot conversation when the preview loads', () => {
        renderComponent()

        expect(mockSetConversationMessages).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ isBot: true, fromAgent: true }),
            ]),
        )
    })

    it('re-seeds the bot conversation when the toggle is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()
        mockSetConversationMessages.mockClear()

        await user.click(screen.getByRole('switch'))

        expect(mockSetConversationMessages).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ isBot: true, fromAgent: true }),
            ]),
        )
    })
})
