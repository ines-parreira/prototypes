import { screen } from '@testing-library/react'

import {
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadAiAgentMessageItem } from '../../../../hooks/messages/types'
import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { render } from '../../../../tests/render.utils'
import type { DisplayedTicketThreadMessageItem } from '../../../TicketMessage/hooks/useDisplayedTicketMessage'
import { AiAgentTicketThreadMessage } from './AiAgentTicketThreadMessage'

const messageBodySpy = vi.fn()
const messageFooterSpy = vi.fn()
const mockUseDisplayedTicketMessage = vi.fn()
const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)

vi.mock('../../../MessageBubble/components/MessageBody', () => ({
    MessageBody: ({
        item,
    }: {
        item: DisplayedTicketThreadMessageItem<TicketThreadAiAgentMessageItem>
    }) => {
        messageBodySpy(item)
        return <div>MessageBody</div>
    },
}))

vi.mock('../../../MessageBubble/components/MessageFooter', () => ({
    MessageFooter: ({
        item,
    }: {
        item: DisplayedTicketThreadMessageItem<TicketThreadAiAgentMessageItem>
    }) => {
        messageFooterSpy(item)
        return <div>MessageFooter</div>
    },
}))

vi.mock('../../../TicketMessageActions/TicketMessageActions', () => ({
    TicketMessageActions: () => <div>TicketMessageActions</div>,
}))

vi.mock('../../../TicketMessage/hooks/useDisplayedTicketMessage', () => ({
    useDisplayedTicketMessage: (args: {
        item: TicketThreadAiAgentMessageItem
    }) => mockUseDisplayedTicketMessage(args),
}))

vi.mock('../../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

vi.mock('./useSmartFollowUps', () => ({
    useSmartFollowUps: () => ({
        shouldRenderMessageContent: true,
        shouldRenderSmartFollowUps: false,
        smartFollowUps: [],
    }),
}))

function makeItem(): TicketThreadAiAgentMessageItem {
    const message = mockTicketMessage({
        id: 42,
        ticket_id: 123,
        body_text: 'Original response',
        stripped_text: 'Original response',
        body_html: null,
        stripped_html: null,
        from_agent: true,
        sender: {
            id: 1,
            name: 'AI Agent',
            firstname: 'AI',
            lastname: 'Agent',
            email: 'ai-agent@example.com',
            meta: null,
        },
    })

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        data: message as TicketThreadAiAgentMessageItem['data'],
        datetime: message.created_datetime,
    }
}

describe('AiAgentTicketThreadMessage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseTicketThreadDateTimeFormat.mockReturnValue({
            format: {
                relative: 'YYYY-MM-DD',
                compact: 'YYYY-MM-DD HH:mm',
            },
            timezone: undefined,
        })
    })

    it('renders body and footer with the displayed ticket message', () => {
        const item = makeItem()
        const displayedItem = {
            ...item,
            data: {
                ...item.data,
                translations: mockTicketMessageTranslation({
                    ticket_message_id: 42,
                    stripped_text: 'Translated response',
                }),
            },
        }
        mockUseDisplayedTicketMessage.mockReturnValue(displayedItem)

        render(<AiAgentTicketThreadMessage item={item} />)

        expect(screen.getByText('MessageBody')).toBeInTheDocument()
        expect(screen.getByText('MessageFooter')).toBeInTheDocument()
        expect(mockUseDisplayedTicketMessage).toHaveBeenCalledWith({ item })
        expect(messageBodySpy).toHaveBeenCalledWith(displayedItem)
        expect(messageFooterSpy).toHaveBeenCalledWith(displayedItem)
    })
})
