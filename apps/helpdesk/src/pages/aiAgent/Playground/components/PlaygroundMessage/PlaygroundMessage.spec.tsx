import React, { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AgentSkill, MessageType } from 'models/aiAgentPlayground/types'
import { AI_AGENT } from 'pages/aiAgent/constants'
import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'

import {
    playgroundAttachmentFixture,
    playgroundErrorMessageFixture,
    playgroundInternalNoteMessageFixture,
    playgroundMessageFixture,
    playgroundPlaceholderMessageFixture,
    playgroundPromptMessageFixture,
    playgroundTicketEventMessageFixture,
} from '../../../fixtures/playgroundMessages.fixture'
import PlaygroundMessage, {
    PlaygroundGenericErrorMessage,
} from './PlaygroundMessage'

const renderComponent = (
    props?: Partial<ComponentProps<typeof PlaygroundMessage>>,
) => {
    return render(
        <Provider
            store={configureMockStore()(storeWithActiveSubscriptionWithConvert)}
        >
            <PlaygroundMessage
                channel="email"
                message={playgroundMessageFixture}
                {...props}
            />
        </Provider>,
    )
}
describe('PlaygroundMessage', () => {
    it('should render placeholder message', () => {
        renderComponent({ message: playgroundPlaceholderMessageFixture })

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render error message', () => {
        renderComponent({ message: playgroundErrorMessageFixture })
        expect(
            screen.getByText(playgroundErrorMessageFixture.content as string),
        ).toBeInTheDocument
        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should render message', () => {
        renderComponent({ message: playgroundMessageFixture })
        expect(screen.getByText(playgroundMessageFixture.content))
            .toBeInTheDocument
    })

    it('should render AI Agent internal note', () => {
        renderComponent({
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.getByText(AI_AGENT)).toBeInTheDocument()
    })

    it('should render chat icon when channel is chat', () => {
        renderComponent({
            channel: 'chat',
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.getByTitle('chat channel')).toBeInTheDocument()
        expect(screen.getByText('forum')).toBeInTheDocument()
        expect(screen.queryByText('Dark Roast')).not.toBeInTheDocument()
    })

    it('should render products carousel when message contains attachments', () => {
        renderComponent({
            channel: 'chat',
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                attachments: [playgroundAttachmentFixture],
            },
        })
        expect(screen.getByText('Dark Roast')).toBeInTheDocument()
    })

    it('should not render products carousel when not type application/productCard', () => {
        renderComponent({
            channel: 'chat',
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                attachments: [
                    { ...playgroundAttachmentFixture, content_type: 'random' },
                ],
            },
        })
        expect(screen.queryByText('Dark Roast')).not.toBeInTheDocument()
    })

    it('should open a new tab when user clicks on the product in the carousel', async () => {
        renderComponent({
            channel: 'chat',
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                attachments: [playgroundAttachmentFixture],
            },
        })

        await userEvent.click(
            screen.getByRole('button', { name: 'Select Options' }),
        )

        expect(window.open).toHaveBeenCalledWith(
            'https://coffee-gorgias-store.myshopify.com/products/dark-roast?variant=35734251045016',
            '_blank',
        )
    })

    it.each([
        {
            type: MessageType.ERROR,
            messageFixture: playgroundErrorMessageFixture,
        },
        {
            type: MessageType.PLACEHOLDER,
            messageFixture: playgroundPlaceholderMessageFixture,
        },
        {
            type: MessageType.INTERNAL_NOTE,
            messageFixture: playgroundInternalNoteMessageFixture,
        },
        {
            type: MessageType.PROMPT,
            messageFixture: playgroundPromptMessageFixture,
        },
        {
            type: MessageType.TICKET_EVENT,
            messageFixture: playgroundTicketEventMessageFixture,
        },
    ])(
        "should not render agent's skill badge if message is of type $0",
        ({ messageFixture }) => {
            renderComponent({ message: messageFixture })
            expect(
                screen.queryByText(AgentSkill.SUPPORT),
            ).not.toBeInTheDocument()
            expect(screen.queryByText(AgentSkill.SALES)).not.toBeInTheDocument()
        },
    )

    it("should not render agent's skill badge if there is none", () => {
        renderComponent({
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.queryByText('SUPPORT')).not.toBeInTheDocument()
        expect(screen.queryByText('SALES')).not.toBeInTheDocument()
    })
})

describe('PlaygroundGenericErrorMessage ', () => {
    it('should render error message', () => {
        render(<PlaygroundGenericErrorMessage onClick={() => {}} />)
        expect(
            screen.getByText(
                'AI Agent encountered an error and didn’t send a response.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Try again.')).toBeInTheDocument()
    })
})
