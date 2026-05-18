import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ConnectedChannelsView } from '../ConnectedChannelsView'

jest.mock('../components/ConnectedChannelsChatView', () => ({
    ConnectedChannelsChatView: () => (
        <div data-testid="connected-channels-chat-view" />
    ),
}))

describe('ConnectedChannelsView', () => {
    it('should render the chat view', () => {
        render(<ConnectedChannelsView />)

        expect(
            screen.getByTestId('connected-channels-chat-view'),
        ).toBeInTheDocument()
    })

    it('should not render email, help center, or contact form tabs', () => {
        render(<ConnectedChannelsView />)

        expect(screen.queryByText('Email')).not.toBeInTheDocument()
        expect(screen.queryByText('Help Center')).not.toBeInTheDocument()
        expect(screen.queryByText('Contact Form')).not.toBeInTheDocument()
    })
})
