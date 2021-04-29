import {shallow} from 'enzyme'

import React from 'react'

import {TicketMessageSourceType} from '../../../../../../business/types/ticket'

import CommentCard from '../CommentCard'

const defaultProps = {
    integrationId: 1,
    messageId: '123',
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
    messageCreatedDatetime: 'Sun Nov 01 2020 01:01:01 UTC+0000',
}

describe('<CommentCard/>', () => {
    describe('render', () => {
        it.each([true, false])(
            'should render the comment card',
            (isFacebookComment) => {
                const component = shallow(
                    <CommentCard
                        {...defaultProps}
                        isFacebookComment={isFacebookComment}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            }
        )
    })
})
