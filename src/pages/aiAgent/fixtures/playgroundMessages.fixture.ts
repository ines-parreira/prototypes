import {
    MessageType,
    PlaygroundErrorMessage,
    PlaygroundInternalNoteMessage,
    PlaygroundPlaceholderMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'

import { AI_AGENT_SENDER } from '../components/PlaygroundMessage/PlaygroundMessage'

export const playgroundMessageFixture: PlaygroundTextMessage = {
    type: MessageType.MESSAGE,
    content: 'Hello, how can I help you?',
    sender: 'AI Agent',
    createdDatetime: '2021-06-01T12:00:00',
}

export const playgroundErrorMessageFixture: PlaygroundErrorMessage = {
    type: MessageType.ERROR,
    content: 'Error: Invalid input',
    sender: 'AI Agent',
    createdDatetime: '2021-06-01T12:00:00',
}

export const playgroundPlaceholderMessageFixture: PlaygroundPlaceholderMessage =
    {
        type: MessageType.PLACEHOLDER,
        sender: 'AI Agent',
        createdDatetime: '2021-06-01T12:00:00',
    }
export const playgroundInternalNoteMessageFixture: PlaygroundInternalNoteMessage =
    {
        type: MessageType.INTERNAL_NOTE,
        content: 'This is an internal note',
        sender: AI_AGENT_SENDER,
        createdDatetime: '2021-06-01T12:00:00',
    }
