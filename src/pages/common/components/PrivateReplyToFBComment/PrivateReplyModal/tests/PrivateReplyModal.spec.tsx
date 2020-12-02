import {shallow} from 'enzyme'

import React from 'react'

import {TicketMessageSourceType} from '../../../../../../business/types/ticket'

import * as infobarActions from '../../../../../../state/infobar/actions'

import PrivateReplyModal from '../PrivateReplyModal'

const defaultProps = {
    integrationId: 1,
    messageId: '123',
    ticketMessageId: 1,
    senderId: 1,
    ticketId: 1,
    facebookComment: 'some comment',
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
    executeAction: infobarActions.executeAction,
}

describe('<PrivateReplyModal/>', () => {
    describe('render', () => {
        it('should render the modal', () => {
            const component = shallow(
                <PrivateReplyModal
                    {...defaultProps}
                    messageCreatedDatetime={'Sun Nov 01 2020 01:01:01 UTC+0000'}
                    isOpen
                    toggle={jest.fn()}
                />
            ).dive()

            expect(component).toMatchSnapshot()
        })
    })
})
