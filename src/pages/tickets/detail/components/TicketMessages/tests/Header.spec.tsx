import { render } from '@testing-library/react'

import {
    duplicatedHiddenFacebookMessage,
    message,
} from 'models/ticket/tests/mocks'
import { Source as SourceType } from 'models/ticket/types'
import Meta from 'pages/tickets/detail/components/TicketMessages/Meta'
import { TicketModalProvider } from 'timeline/ticket-modal/components/TicketModalProvider'
import { assumeMock } from 'utils/testing'

import Header from '../Header'
import Source from '../Source'

jest.mock('pages/tickets/detail/components/TicketMessages/Meta')
jest.mock(
    'pages/tickets/detail/components/TicketMessages/SourceActionsHeader',
    () => ({
        default: () => null,
    }),
)
jest.mock('pages/tickets/detail/components/TicketMessages/Source', () =>
    jest.fn(() => null),
)

const metaMock = assumeMock(Meta)

describe('Header', () => {
    beforeEach(() => {
        metaMock.mockImplementation(() => <div></div>)
    })

    it('should display header', () => {
        const { container } = render(
            <Header
                id="some-header"
                message={message}
                isMessageHidden={false}
                isMessageDeleted={false}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display header with metaContent = "Message hidden"', () => {
        const { container } = render(
            <Header
                id="some-header"
                message={message}
                isMessageHidden={true}
                isMessageDeleted={false}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display header with metaContent = "Message hidden" because the message is duplicated', () => {
        const { container } = render(
            <Header
                id="some-header"
                message={duplicatedHiddenFacebookMessage}
                isMessageHidden={true}
                isMessageDeleted={false}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display header with metaContent = "Comment deleted on Facebook"', () => {
        const { container } = render(
            <Header
                id="some-header"
                message={message}
                isMessageHidden={false}
                isMessageDeleted={true}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should pass the correct message id to Meta', () => {
        render(
            <Header
                id="some-header"
                message={message}
                isMessageHidden={false}
                isMessageDeleted={false}
            />,
        )

        expect(metaMock).toHaveBeenCalledWith(
            expect.objectContaining({ messageId: message.message_id }),
            expect.any(Object),
        )
    })

    it('should correctly display intents', () => {
        const { container } = render(
            <Header
                id="some-header"
                message={message}
                isMessageHidden={false}
                isMessageDeleted={false}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the passed sourceDetail node', () => {
        const { getByText } = render(
            <Header
                id="some-header"
                message={message}
                sourceDetails={<div>SourceDetails</div>}
            />,
        )

        expect(getByText('SourceDetails')).toBeInTheDocument()
    })

    it('should pass the containerRef to the Source component', () => {
        render(
            <TicketModalProvider>
                <Header
                    id="some-header"
                    message={{
                        ...message,
                        source: { type: 'email' } as SourceType,
                    }}
                />
            </TicketModalProvider>,
        )
        expect(Source).toHaveBeenCalledWith(
            expect.objectContaining({ containerRef: expect.any(Object) }),
            expect.any(Object),
        )
    })
})
