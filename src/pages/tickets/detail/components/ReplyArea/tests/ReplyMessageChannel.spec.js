import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    CHAT_SOURCE,
    EMAIL_SOURCE,
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_MESSENGER_SOURCE,
    FACEBOOK_POST_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
    INSTAGRAM_MEDIA_SOURCE,
} from '../../../../../../config/ticket'

import configureStore from '../../../../../../store/configureStore'
import ReplyMessageChannel from '../ReplyMessageChannel'

const baseReply = {
    email: {answerable: true},
    ['internal-note']: {answerable: true},
}

describe('ReplyMessageChannel component', () => {
    it('new ticket', () => {
        const component = shallow(
            <ReplyMessageChannel store={configureStore()} ticket={fromJS({})} />
        ).dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })

    it('existing ticket without messages', () => {
        const component = shallow(
            <ReplyMessageChannel
                store={configureStore({
                    ticket: fromJS({
                        id: 12,
                    }),
                })}
            />
        ).dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })

    const types = [
        CHAT_SOURCE,
        EMAIL_SOURCE,
        FACEBOOK_MESSENGER_SOURCE,
        FACEBOOK_POST_SOURCE,
        FACEBOOK_COMMENT_SOURCE,
        INSTAGRAM_AD_MEDIA_SOURCE,
        INSTAGRAM_AD_COMMENT_SOURCE,
        INSTAGRAM_MEDIA_SOURCE,
        INSTAGRAM_COMMENT_SOURCE,
    ]

    types.forEach((type) => {
        it(`existing ticket with message of type ${type}`, () => {
            let newMessageType = type

            if (type === FACEBOOK_POST_SOURCE) {
                newMessageType = FACEBOOK_COMMENT_SOURCE
            } else if (type === INSTAGRAM_MEDIA_SOURCE) {
                newMessageType = INSTAGRAM_COMMENT_SOURCE
            } else if (type === INSTAGRAM_AD_MEDIA_SOURCE) {
                newMessageType = INSTAGRAM_AD_COMMENT_SOURCE
            }

            const replyOptions = {
                ...baseReply,
                [newMessageType]: {answerable: true},
            }

            const component = shallow(
                <ReplyMessageChannel
                    store={configureStore({
                        ticket: fromJS({
                            id: 12,
                            reply_options: replyOptions,
                            messages: [
                                {
                                    id: 1,
                                    source: {
                                        type: type,
                                    },
                                },
                            ],
                        }),
                        newMessage: fromJS({
                            newMessage: {
                                source: {
                                    type: newMessageType,
                                },
                            },
                        }),
                    })}
                />
            ).dive() // dive in connect()ed component
            expect(component).toMatchSnapshot()
        })
    })

    it('existing ticket with last message as chat message', () => {
        const component = shallow(
            <ReplyMessageChannel
                store={configureStore({
                    ticket: fromJS({
                        id: 12,
                        reply_options: {
                            ...baseReply,
                            chat: {answerable: true},
                        },
                        messages: [
                            {
                                id: 2,
                                source: {
                                    type: 'chat',
                                },
                                created_datetime:
                                    '2017-07-27T22:03:30.656613+00:00',
                            },
                            {
                                id: 1,
                                source: {
                                    type: 'email',
                                },
                                created_datetime:
                                    '2017-07-26T22:03:30.656613+00:00',
                            },
                        ],
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                type: 'chat',
                            },
                        },
                    }),
                })}
            />
        ).dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })
})
