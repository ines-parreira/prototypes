import React from 'react'

import {Button} from 'reactstrap'

import {render} from '@testing-library/react'

import PrivateReplyButton from '../PrivateReplyButton'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'
import * as infobarActions from '../../../../../state/infobar/actions'

const defaultProps = {
    integrationId: 1,
    messageId: '123',
    ticketMessageId: 1,
    senderId: 1,
    ticketId: 1,
    commentMessage: 'some comment',
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
    isFacebookComment: true,
    executeAction: infobarActions.executeAction,
}

describe('<PrivateReplyButton/>', () => {
    describe('render', () => {
        it('should render the button', () => {
            const {container} = render(
                <PrivateReplyButton
                    {...defaultProps}
                    messageCreatedDatetime={Date().toString()}
                    component={Button}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it.each([true, false])(
            'should render a disabled button',
            (is_already_sent) => {
                let meta
                let createdDatetime = 'Sun Nov 01 2020 01:01:01 UTC+0000'

                if (is_already_sent) {
                    meta = {private_reply: {already_sent: true}}
                    createdDatetime = Date().toString()
                }

                const {container} = render(
                    <PrivateReplyButton
                        {...defaultProps}
                        messageCreatedDatetime={createdDatetime}
                        meta={meta}
                        component={Button}
                    />
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })
})
