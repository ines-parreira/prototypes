import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
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

jest.mock('../MessageSourceFields/MessageSourceFields', () => () => (
    <div>MessageSourceFields</div>
))
jest.mock('../ConvertToForwardPopover', () => () => (
    <div>ConvertToForwardPopover</div>
))

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
        hasWhatsAppIntegration: false,
        prepareNewMessage: jest.fn(),
        whatsAppMessageTemplatesEnabled: false,
    }

    it('new ticket', () => {
        const {container} = render(
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
        expect(container).toMatchSnapshot()
    })

    it('existing ticket without messages', () => {
        const {container} = render(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    id: 12,
                    reply_options: {},
                })}
            />
        )
        expect(container).toMatchSnapshot()
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

            const {container} = render(
                <ReplyMessageChannelContainer
                    {...minProps}
                    ticket={fromJS({
                        id: 12,
                        reply_options: replyOptions,
                    })}
                    sourceType={newMessageType}
                />
            )
            expect(container).toMatchSnapshot()
        })
    })

    it('existing ticket with last message as chat message', () => {
        const {container} = render(
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
        expect(container).toMatchSnapshot()
    })

    it('should render "Call" option for existing phone ticket', () => {
        const {getByText} = render(
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
        expect(getByText('Call')).toBeVisible()
    })

    it('should render "Call" option for new ticket', () => {
        const {getByText} = render(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    reply_options: {},
                })}
                hasPhoneIntegration
            />
        )
        expect(getByText('Call')).toBeVisible()
    })

    it('should render option for sending WhatsApp templates for new ticket', () => {
        const {getByText} = render(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    reply_options: {},
                })}
                isNewMessagePublic
                hasWhatsAppIntegration
                whatsAppMessageTemplatesEnabled
            />
        )
        expect(getByText(/whatsapp/i)).toBeVisible()
    })

    it('should render option for replying to WhatsApp message for existing ticket', () => {
        const {getByText} = render(
            <ReplyMessageChannelContainer
                {...minProps}
                ticket={fromJS({
                    id: 12,
                    reply_options: {
                        [TicketMessageSourceType.WhatsAppMessage]: {
                            answerable: true,
                        },
                    },
                })}
                isNewMessagePublic
                hasWhatsAppIntegration
            />
        )
        expect(getByText(/whatsapp/i)).toBeVisible()
    })
})
