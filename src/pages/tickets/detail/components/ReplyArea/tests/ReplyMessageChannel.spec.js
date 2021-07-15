import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    CHAT_SOURCE,
    EMAIL_SOURCE,
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_MENTION_COMMENT_SOURCE,
    FACEBOOK_MENTION_POST_SOURCE,
    FACEBOOK_MESSENGER_SOURCE,
    FACEBOOK_POST_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
    INSTAGRAM_MEDIA_SOURCE,
    TWITTER_TWEET_SOURCE,
} from '../../../../../../config/ticket.ts'
import {ReplyMessageChannelContainer} from '../ReplyMessageChannel'
import {TicketMessageSourceType} from '../../../../../../business/types/ticket.ts'

const baseReply = {
    email: {answerable: true},
    ['internal-note']: {answerable: true},
}

describe('ReplyMessageChannel component', () => {
    const minProps = {
        accountChannels: fromJS([]),
        channel: '',
        hasRecipients: false,
        isForward: false,
        isNewMessagePublic: false,
        messages: fromJS({}),
        sourceType: 'email',
        prepareNewMessage: () => {},
    }

    it('new ticket', () => {
        const component = shallow(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    reply_options: {
                        'internal-note': {
                            answerable: true,
                        },
                    },
                })}
                isNewMessagePublic
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('existing ticket without messages', () => {
        const component = shallow(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    id: 12,
                    reply_options: {},
                })}
                messages={fromJS([])}
            />
        )
        expect(component).toMatchSnapshot()
    })

    const types = [
        CHAT_SOURCE,
        EMAIL_SOURCE,
        FACEBOOK_MESSENGER_SOURCE,
        FACEBOOK_POST_SOURCE,
        FACEBOOK_COMMENT_SOURCE,
        FACEBOOK_MENTION_POST_SOURCE,
        FACEBOOK_MENTION_COMMENT_SOURCE,
        INSTAGRAM_AD_MEDIA_SOURCE,
        INSTAGRAM_AD_COMMENT_SOURCE,
        INSTAGRAM_MEDIA_SOURCE,
        INSTAGRAM_COMMENT_SOURCE,
        TWITTER_TWEET_SOURCE,
    ]

    types.forEach((type) => {
        it(`existing ticket with message of type ${type}`, () => {
            let newMessageType = type

            if (type === FACEBOOK_POST_SOURCE) {
                newMessageType = FACEBOOK_COMMENT_SOURCE
            } else if (type === FACEBOOK_MENTION_POST_SOURCE) {
                newMessageType = FACEBOOK_MENTION_COMMENT_SOURCE
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
                <ReplyMessageChannelContainer
                    {...minProps}
                    ticket={fromJS({
                        id: 12,
                        reply_options: replyOptions,
                    })}
                    messages={fromJS([
                        {
                            id: 1,
                            source: {
                                type: type,
                            },
                        },
                    ])}
                    sourceType={newMessageType}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })

    it('existing ticket with last message as chat message', () => {
        const component = shallow(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    id: 12,
                    reply_options: {
                        ...baseReply,
                        chat: {answerable: true},
                    },
                })}
                messages={fromJS([
                    {
                        id: 2,
                        source: {
                            type: 'chat',
                        },
                        created_datetime: '2017-07-27T22:03:30.656613+00:00',
                    },
                    {
                        id: 1,
                        source: {
                            type: 'email',
                        },
                        created_datetime: '2017-07-26T22:03:30.656613+00:00',
                    },
                ])}
                sourceType={'chat'}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render option "Make outbound call" for existing phone ticket', () => {
        const component = shallow(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    id: 12,
                    reply_options: {
                        [TicketMessageSourceType.Phone]: true,
                    },
                })}
                messages={fromJS([])}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
