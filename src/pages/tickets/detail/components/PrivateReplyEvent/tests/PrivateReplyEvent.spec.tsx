import {shallow} from 'enzyme'

import React from 'react'

import {fromJS, Map} from 'immutable'

import PrivateReplyEvent from '../PrivateReplyEvent'
import {
    COMMENT_TICKET_PRIVATE_REPLY_EVENT,
    FACEBOOK_PRIVATE_REPLY_ACTION,
    MESSAGING_TICKET_PRIVATE_REPLY_EVENT,
} from '../constants'

const event = {
    id: 743,
    type: 'action-executed',
    user: {
        id: 2,
        firstname: 'Alex',
        lastname: 'Plugaru',
        name: 'Alex Plugaru',
        email: 'alex@gorgias.io',
    },
    data: {
        status: 'success',
        payload: {
            facebook_comment: 'Nice post!',
            comment_message_sender: {
                id: 6,
                meta: {name_set_via: 'facebook'},
                name: 'Mehdi D LA J',
                email: null,
                lastname: 'LA J',
                firstname: 'Mehdi',
            },
            private_reply_event_type: 'CommentTicketPrivateReplyEvent',
            from_ticket_message_id: 326,
            message_id: '1537287279812902_1664359293772366',
            comment_message_source: {
                to: [
                    {
                        name: "L'acteur",
                        address: '657788504429455-657788504429455',
                    },
                ],
                from: {
                    name: 'Mehdi D LA J',
                    address: '657788504429455-3609805465727160',
                },
                type: 'facebook-comment',
                extra: {
                    page_id: '657788504429455',
                    post_id: '657788504429455_1537287279812902',
                    parent_id: '657788504429455_1537287279812902',
                },
            },
            comment_message_datetime: '2021-04-27T01:45:26+00:00',
            comment_message_meta: null,
            messenger_reply: 'thanks for your comment!',
        },
        action_name: 'facebookPrivateReply',
        integration_id: 8,
        messenger_ticket_id: 184,
    },
    created_datetime: '2021-04-27T01:50:16.832898+00:00',
    isEvent: true,
}

const defaultProps = {
    event: fromJS(event) as Map<any, any>,
    isLast: true,
}

describe('<PrivateReplyEvent/>', () => {
    describe('render', () => {
        it('should render a `Responded via Facebook Messenger` event', () => {
            defaultProps.event = defaultProps.event.setIn(
                ['data', 'payload', 'private_reply_event_type'],
                COMMENT_TICKET_PRIVATE_REPLY_EVENT
            )

            defaultProps.event = defaultProps.event.setIn(
                ['data', 'action_name'],
                FACEBOOK_PRIVATE_REPLY_ACTION
            )

            const component = shallow(<PrivateReplyEvent {...defaultProps} />)
            expect(component).toMatchSnapshot()
        })

        it('should render a `Responding to a Facebook comment` event', () => {
            defaultProps.event = defaultProps.event.setIn(
                ['data', 'payload', 'private_reply_event_type'],
                MESSAGING_TICKET_PRIVATE_REPLY_EVENT
            )

            defaultProps.event = defaultProps.event.setIn(
                ['data', 'action_name'],
                FACEBOOK_PRIVATE_REPLY_ACTION
            )

            const component = shallow(<PrivateReplyEvent {...defaultProps} />)
            expect(component).toMatchSnapshot()
        })

        it('should render a `Responded via Instagram Direct Message` event', () => {
            defaultProps.event = defaultProps.event.setIn(
                ['data', 'payload', 'private_reply_event_type'],
                COMMENT_TICKET_PRIVATE_REPLY_EVENT
            )

            defaultProps.event = defaultProps.event.setIn(
                ['data', 'action_name'],
                'instagramPrivateReply'
            )
            const component = shallow(<PrivateReplyEvent {...defaultProps} />)
            expect(component).toMatchSnapshot()
        })

        it('should render a `Responding to an Instagram comment` event', () => {
            defaultProps.event = defaultProps.event.setIn(
                ['data', 'payload', 'private_reply_event_type'],
                MESSAGING_TICKET_PRIVATE_REPLY_EVENT
            )

            defaultProps.event = defaultProps.event.setIn(
                ['data', 'action_name'],
                'instagramPrivateReply'
            )
            const component = shallow(<PrivateReplyEvent {...defaultProps} />)
            expect(component).toMatchSnapshot()
        })
    })
})
