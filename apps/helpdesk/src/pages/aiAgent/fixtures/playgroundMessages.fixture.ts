import type {
    AiAgentAttachment,
    PlaygroundErrorMessage,
    PlaygroundInternalNoteMessage,
    PlaygroundPlaceholderMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
    PlaygroundTicketEventMessage,
} from 'models/aiAgentPlayground/types'
import {
    MessageType,
    PlaygroundPromptType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { AI_AGENT_SENDER } from 'pages/aiAgent/PlaygroundV2/constants'

export const playgroundMessageFixture: PlaygroundTextMessage = {
    id: '00000000-0000-0000-0000-000000000000',
    type: MessageType.MESSAGE,
    content: 'Hello, how can I help you?',
    sender: AI_AGENT_SENDER,
    createdDatetime: '2021-06-01T12:00:00',
}

export const playgroundErrorMessageFixture: PlaygroundErrorMessage = {
    type: MessageType.ERROR,
    content: 'Error: Invalid input',
    sender: AI_AGENT_SENDER,
    createdDatetime: '2021-06-01T12:00:00',
}

export const playgroundPlaceholderMessageFixture: PlaygroundPlaceholderMessage =
    {
        type: MessageType.PLACEHOLDER,
        sender: AI_AGENT_SENDER,
        createdDatetime: '2021-06-01T12:00:00',
    }
export const playgroundInternalNoteMessageFixture: PlaygroundInternalNoteMessage =
    {
        type: MessageType.INTERNAL_NOTE,
        content: 'This is an internal note',
        sender: AI_AGENT_SENDER,
        createdDatetime: '2021-06-01T12:00:00',
    }

export const playgroundPromptMessageFixture: PlaygroundPromptMessage = {
    type: MessageType.PROMPT,
    prompt: PlaygroundPromptType.RELEVANT_RESPONSE,
    content: 'Dummy content',
    sender: AI_AGENT_SENDER,
    createdDatetime: '2021-06-01T12:00:00',
}

export const playgroundTicketEventMessageFixture: PlaygroundTicketEventMessage =
    {
        type: MessageType.TICKET_EVENT,
        outcome: TicketOutcome.WAIT,
        sender: AI_AGENT_SENDER,
        createdDatetime: '2021-06-01T12:00:00',
    }

export const playgroundCustomerMessage: PlaygroundTextMessage = {
    id: '00000000-0000-0000-0000-000000000000',
    type: MessageType.MESSAGE,
    content: 'Hello, how can I help you?',
    sender: 'customer',
    createdDatetime: '2021-06-01T12:00:00',
}

export const playgroundAttachmentFixture: AiAgentAttachment = {
    name: 'Dark Roast',
    content_type: 'application/productCard',
    public: true,
    size: 0,
    url: 'https://coffe.png',
    extra: {
        currency: 'USD',
        price: '16.00',
        product_id: '5628771565720',
        product_link:
            'https://coffee-gorgias-store.myshopify.com/products/dark-roast?variant=35734251045016',
        variant_name: '12 oz',
        variant_id: '35734251045016',
        variant_link:
            'https://coffee-gorgias-store.myshopify.com/products/dark-roast?variant=35734251045016',
        featured_image: 'https://coffee.png',
        shortened_product_link: 'https://gorgias-convert.com/r/Yl9JQh',
    },
}
