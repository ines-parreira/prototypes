import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {TicketMessageSourceType} from 'business/types/ticket'

import {ReplyMessageChannelContainer} from '../DEPRECATED_ReplyMessageChannel'

jest.mock('../MessageSourceFields/DEPRECATED_MessageSourceFields', () => () => (
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
        const ticket = fromJS({
            reply_options: {
                'internal-note': {
                    answerable: true,
                },
            },
        })

        const store = configureMockStore([thunk])({
            ticket,
        })

        const {container} = render(
            <Provider store={store}>
                <ReplyMessageChannelContainer
                    {...minProps}
                    ticket={ticket}
                    isNewMessagePublic
                />
            </Provider>
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
        TicketMessageSourceType.Chat,
        TicketMessageSourceType.Email,
        TicketMessageSourceType.FacebookMessenger,
        TicketMessageSourceType.FacebookPost,
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionPost,
        TicketMessageSourceType.FacebookMentionComment,
        TicketMessageSourceType.InstagramAdMedia,
        TicketMessageSourceType.InstagramAdComment,
        TicketMessageSourceType.InstagramMedia,
        TicketMessageSourceType.InstagramComment,
        TicketMessageSourceType.TwitterTweet,
        TicketMessageSourceType.TwitterQuotedTweet,
        TicketMessageSourceType.TwitterMentionTweet,
        TicketMessageSourceType.YotpoReview,
    ]

    types.forEach((type) => {
        it(`existing ticket with message of type ${type}`, () => {
            let newMessageType = type

            if (type === TicketMessageSourceType.FacebookPost) {
                newMessageType = TicketMessageSourceType.FacebookComment
            } else if (type === TicketMessageSourceType.FacebookMentionPost) {
                newMessageType = TicketMessageSourceType.FacebookMentionComment
            } else if (type === TicketMessageSourceType.InstagramMedia) {
                newMessageType = TicketMessageSourceType.InstagramComment
            } else if (type === TicketMessageSourceType.InstagramAdMedia) {
                newMessageType = TicketMessageSourceType.InstagramAdComment
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
        const ticket = fromJS({
            reply_options: {},
        })

        const store = configureMockStore([thunk])({
            ticket,
        })

        const {getByText} = render(
            <Provider store={store}>
                <ReplyMessageChannelContainer
                    {...minProps}
                    ticket={ticket}
                    isNewMessagePublic
                    hasWhatsAppIntegration
                    whatsAppMessageTemplatesEnabled
                />
            </Provider>
        )
        expect(getByText(/whatsapp/i)).toBeVisible()
    })

    it('should render option for replying to WhatsApp message for existing ticket', () => {
        const ticket = fromJS({
            id: 12,
            reply_options: {
                [TicketMessageSourceType.WhatsAppMessage]: {
                    answerable: true,
                },
            },
        })
        const store = configureMockStore([thunk])({
            ticket,
        })

        const {getByText} = render(
            <Provider store={store}>
                <ReplyMessageChannelContainer
                    {...minProps}
                    ticket={ticket}
                    isNewMessagePublic
                    hasWhatsAppIntegration
                />
            </Provider>
        )
        expect(getByText(/whatsapp/i)).toBeVisible()
    })
})
