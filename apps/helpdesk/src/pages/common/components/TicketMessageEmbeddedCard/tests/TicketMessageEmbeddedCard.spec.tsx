import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { TicketMessageSourceType } from 'business/types/ticket'

import TicketMessageEmbeddedCard from '../TicketMessageEmbeddedCard'

jest.mock(
    'pages/tickets/detail/components/TicketMessages/Meta.tsx',
    () => () => <div>MockedTicketMessageMeta</div>,
)

jest.mock(
    'pages/tickets/detail/components/ReplyArea/TicketAttachments.tsx',
    () => () => <div>MockedTicketAttachments</div>,
)

jest.mock('pages/common/utils/DatetimeLabel', () => () => (
    <div>MockedDatetimeLabel</div>
))

const defaultProps = {
    integrationId: 1,
    messageId: '123',
    messageText: 'some comment',
    source: {
        type: TicketMessageSourceType.FacebookComment,
        from: {
            address: 'some_from_address',
            name: 'some_from_name',
        },
        to: [
            {
                address: 'some_from_address',
                name: 'some_from_name',
            },
        ],
    },
    sender: {
        id: 123,
        email: 'some_email@foo.com',
        name: 'some_sender_name',
        firstname: 'some_sender_firstname',
        lastname: 'some_sender_lastname',
    },
    messageCreatedDatetime: 'Sun Nov 01 2020 01:01:01 UTC+0000',
}

describe('<TicketMessageEmbeddedCard/>', () => {
    it.each([true, false])(
        'should render the comment card with different text positions',
        (textBelowAvatar) => {
            const localDefaultProps = {
                ...defaultProps,
                textBelowAvatar: textBelowAvatar,
            }
            const { container } = render(
                <TicketMessageEmbeddedCard {...localDefaultProps} />,
            )

            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it.each([true, false])(
        'should render the comment card with or without messageCreatedDatetime',
        (hasMessageCreatedDatetime) => {
            const localDefaultProps = {
                ...defaultProps,
                messageCreatedDatetime: hasMessageCreatedDatetime
                    ? defaultProps.messageCreatedDatetime
                    : undefined,
            }

            if (!hasMessageCreatedDatetime) {
                localDefaultProps.messageCreatedDatetime = undefined
            }

            render(
                <TicketMessageEmbeddedCard
                    {...localDefaultProps}
                    textBelowAvatar={false}
                />,
            )

            const messageCreatedDatetimeElem = screen.queryAllByText(
                'MockedDatetimeLabel',
            )
            if (hasMessageCreatedDatetime) {
                return expect(
                    messageCreatedDatetimeElem.length,
                ).toBeGreaterThanOrEqual(1)
            }
            expect(messageCreatedDatetimeElem.length).toBe(0)
        },
    )

    it.each([
        [
            [
                {
                    content_type: 'foo_content',
                    name: 'foo_name',
                    size: 123,
                    url: 'foo_URL',
                    type: 'foo_type',
                },
            ],
            true,
        ],
        [[], true],
        [undefined, false],
    ])(
        'should render the comment card with or without attachments',
        (attachments, result) => {
            const localDefaultProps = {
                ...defaultProps,
                attachments: fromJS(attachments),
            }

            render(
                <TicketMessageEmbeddedCard
                    {...localDefaultProps}
                    textBelowAvatar={false}
                />,
            )
            const attachmentsElem = screen.queryByText(
                'MockedTicketAttachments',
            )
            if (result) {
                return expect(attachmentsElem).toBeInTheDocument()
            }
            expect(attachmentsElem).toBeNull()
        },
    )
})
