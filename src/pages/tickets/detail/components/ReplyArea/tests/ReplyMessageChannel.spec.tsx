import React, {ComponentProps} from 'react'
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
    TWITTER_QUOTED_TWEET_SOURCE,
    TWITTER_MENTION_TWEET_SOURCE,
    YOTPO_REVIEW_SOURCE,
} from 'config/ticket'
import {TicketMessageSourceType} from 'business/types/ticket'

import {ReplyMessageChannelContainer} from '../ReplyMessageChannel'

const baseReply = {
    email: {answerable: true},
    ['internal-note']: {answerable: true},
}

describe('ReplyMessageChannel component', () => {
    const minProps: ComponentProps<typeof ReplyMessageChannelContainer> = {
        hasRecipients: false,
        isForward: false,
        isNewMessagePublic: false,
        sourceType: TicketMessageSourceType.Email,
        ticket: fromJS({}),
        hasPhoneIntegration: false,
        hasSmsIntegration: false,
        prepareNewMessage: jest.fn(),
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
        TWITTER_QUOTED_TWEET_SOURCE,
        TWITTER_MENTION_TWEET_SOURCE,
        YOTPO_REVIEW_SOURCE,
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
                sourceType={TicketMessageSourceType.Chat}
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
                hasPhoneIntegration
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render option "Make outbound call" for new ticket', () => {
        const component = shallow(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    reply_options: {},
                })}
                hasPhoneIntegration
            />
        )
        expect(component).toMatchSnapshot()
    })
})
