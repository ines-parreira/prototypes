import {render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {AI_AGENT} from 'pages/automate/common/components/constants'

import {
    playgroundErrorMessageFixture,
    playgroundMessageFixture,
    playgroundPlaceholderMessageFixture,
} from '../../fixtures/playgroundMessages.fixture'
import PlaygroundMessage, {
    PlaygroundGenericErrorMessage,
} from './PlaygroundMessage'

const renderComponent = (
    props?: Partial<ComponentProps<typeof PlaygroundMessage>>
) => {
    return render(
        <PlaygroundMessage
            channel="email"
            message={playgroundMessageFixture}
            {...props}
        />
    )
}
describe('PlaygroundMessage', () => {
    it('should render placeholder message', () => {
        renderComponent({message: playgroundPlaceholderMessageFixture})

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render error message', () => {
        renderComponent({message: playgroundErrorMessageFixture})
        expect(
            screen.getByText(playgroundErrorMessageFixture.content as string)
        ).toBeInTheDocument
        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should render message', () => {
        renderComponent({message: playgroundMessageFixture})
        expect(screen.getByText(playgroundMessageFixture.content))
            .toBeInTheDocument
    })

    it('should render AI Agent internal note', () => {
        renderComponent({
            message: {...playgroundMessageFixture, sender: AI_AGENT},
        })
        expect(screen.getByText(AI_AGENT)).toBeInTheDocument()
    })

    it('should render chat icon when channel is chat', () => {
        renderComponent({
            channel: 'chat',
            message: {...playgroundMessageFixture, sender: AI_AGENT},
        })
        expect(screen.getByTitle('chat channel')).toBeInTheDocument()
        expect(screen.getByText('forum')).toBeInTheDocument()
    })
})

describe('PlaygroundGenericErrorMessage ', () => {
    it('should render error message', () => {
        render(<PlaygroundGenericErrorMessage onClick={() => {}} />)
        expect(
            screen.getByText(
                'AI Agent encountered an error and didn’t send a response.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Try again.')).toBeInTheDocument()
    })
})
