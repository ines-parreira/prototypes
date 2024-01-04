import React, {ComponentProps} from 'react'
import moment from 'moment'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {IntegrationType} from 'models/integration/constants'
import {
    message,
    duplicatedHiddenFacebookMessage,
} from 'models/ticket/tests/mocks'
import Avatar from 'pages/common/components/Avatar/Avatar'

import Container from '../Container'

const customer = fromJS({
    integrations: {
        15: {
            __integration_type__: 'weirdtype',
            customer: {
                foo: 'bar',
            },
        },
    },
})

jest.mock(
    'pages/common/components/Avatar/Avatar',
    () =>
        ({badgeColor}: ComponentProps<typeof Avatar>) =>
            (
                <div>
                    Avatar
                    <div>badgeColor: {badgeColor}</div>
                </div>
            )
)

jest.mock('pages/tickets/detail/components/TicketMessages/Footer', () => () => (
    <div>Footer</div>
))

jest.mock('pages/tickets/detail/components/TicketMessages/Header', () => () => (
    <div>Header</div>
))

describe('Container', () => {
    const props = {
        id: 'some-header',
        hasCursor: false,
        message,
        timezone: 'America/Los_Angeles',
        isLastRead: false,
        lastMessageDatetimeAfterMount: moment('2017-01-01T12:12:34Z'),
        isMessageHidden: false,
        isMessageDeleted: false,
        isBodyHighlighted: false,
        containsLastCustomerMessage: false,
        customer,
    }

    it('should render', () => {
        const {container} = render(<Container {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render container without an avatar because the message is hidden', () => {
        const {queryByText} = render(
            <Container {...props} isMessageHidden={true} />
        )

        expect(queryByText('Avatar')).not.toBeInTheDocument()
    })

    it('should render container without an avatar because the message is deleted', () => {
        const {queryByText} = render(
            <Container {...props} isMessageDeleted={true} />
        )

        expect(queryByText('Avatar')).not.toBeInTheDocument()
    })

    it('should render container with isBodyHiglighted because it should be highlighted', () => {
        const {container} = render(
            <Container {...props} isBodyHighlighted={true} />
        )

        expect(
            (container.firstChild as Element).classList.contains(
                'ticketMessagesHighlighted'
            )
        ).toBe(true)
    })

    it('should render container with an avatar because the hidden message is duplicated', () => {
        const {queryByText} = render(
            <Container
                {...props}
                message={duplicatedHiddenFacebookMessage}
                isMessageHidden={true}
            />
        )

        expect(queryByText('Avatar')).toBeInTheDocument()
    })

    it('should have hasError class if message has failed', () => {
        const failedMessage = {
            ...message,
            failed_datetime: '2017-01-01T12:12:34Z',
        }
        const {container, rerender} = render(<Container {...props} />)

        expect(
            (container.firstChild as Element).classList.contains('hasError')
        ).toBe(false)

        rerender(<Container {...props} message={failedMessage} />)

        expect(
            (container.firstChild as Element).classList.contains('hasError')
        ).toBe(true)
    })

    it("should define a badge color when it's the last message of customer and from chat", () => {
        const {getByText} = render(
            <Container
                {...props}
                customer={fromJS({
                    integrations: {
                        15: {
                            __integration_type__: IntegrationType.GorgiasChat,
                            chat_recent_activity_timestamp:
                                '2023-12-27T21:25:54.790Z',
                        },
                    },
                })}
                containsLastCustomerMessage
            />
        )

        expect(getByText('Avatar')).toMatchSnapshot()
    })
})
