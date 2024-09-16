import {
    MessageType,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'

export const playgroundMessageFixture: PlaygroundTextMessage = {
    type: MessageType.MESSAGE,
    content: 'Hello, how can I help you?',
    sender: 'AI Agent',
    createdDatetime: '2021-06-01T12:00:00',
}
