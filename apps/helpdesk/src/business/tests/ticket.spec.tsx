import React from 'react'

import { Link } from 'react-router-dom'

import * as channelsService from 'services/channels'
import { NotificationStatus } from 'state/notifications/types'

import { canAddAttachments, canReply } from '../ticket'
import { TicketMessageSourceType } from '../types/ticket'

describe('Business', () => {
    describe('ticket', () => {
        describe('canAddAttachments()', () => {
            let messageType: TicketMessageSourceType
            let newMessage: string
            let attachmentCount: number

            it('should not allow to add when Instagram DM has already text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramDirectMessage
                newMessage = 'Hello'
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount,
                )

                // Then
                expect(result?.message).toEqual(
                    'When using Instagram direct message, you can either send a text message, or an image attachment, but not both at the same time.',
                )
            })

            it('should allow to add when Instagram DM has no text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramDirectMessage
                newMessage = ''
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount,
                )

                // Then
                expect(result).toBeNull()
            })

            it('should not allow to add attachments to Instagram comments, even with no text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramComment
                newMessage = ''
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount,
                )

                // Then
                expect(result?.message).toEqual(
                    'When using Instagram comment, you can not send attachments.',
                )
            })

            it('should not allow to add attachments to Instagram mentions, even with no text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramMentionComment
                newMessage = ''
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount,
                )

                // Then
                expect(result?.message).toEqual(
                    'When using Instagram mention comment, you can not send attachments.',
                )
            })

            describe('only one attachment allowed', () => {
                beforeEach(() => {
                    attachmentCount = 2
                    newMessage = ''
                })

                it('should not allow to add when facebook-comment', () => {
                    // Given
                    messageType = TicketMessageSourceType.FacebookComment

                    // When
                    const result = canAddAttachments(
                        messageType,
                        newMessage,
                        attachmentCount,
                    )

                    // Then
                    expect(result?.message).toEqual(
                        'When using Facebook comment, you can only send attachments one by one.',
                    )
                })

                it('should not allow to add when facebook-messenger', () => {
                    // Given
                    messageType = TicketMessageSourceType.InstagramDirectMessage

                    // When
                    const result = canAddAttachments(
                        messageType,
                        newMessage,
                        attachmentCount,
                    )

                    // Then
                    expect(result?.message).toEqual(
                        'When using Instagram direct message, you can only send attachments one by one.',
                    )
                })
            })

            it('should allow to add when twitter-tweet with less than 4 attachments', () => {
                // Given
                messageType = TicketMessageSourceType.TwitterTweet
                attachmentCount = 3

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount,
                )

                // Then
                expect(result).toBeNull()
            })

            it('should allow to add when twitter-direct-message with less than 2 attachments', () => {
                // Given
                messageType = TicketMessageSourceType.TwitterDirectMessage
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount,
                )

                // Then
                expect(result).toBeNull()
            })

            describe('only X attachments allowed', () => {
                it('should not allow to add when twitter-tweet with more than 4 attachments', () => {
                    // Given
                    messageType = TicketMessageSourceType.TwitterTweet
                    attachmentCount = 5

                    // When
                    const result = canAddAttachments(
                        messageType,
                        newMessage,
                        attachmentCount,
                    )

                    // Then
                    expect(result?.message).toEqual(
                        `When using Twitter tweet, you can add a maximum of 4 attachments.`,
                    )
                })

                it('should not allow to add when twitter-direct-message with more than 1 attachments', () => {
                    // Given
                    messageType = TicketMessageSourceType.TwitterDirectMessage
                    attachmentCount = 2

                    // When
                    const result = canAddAttachments(
                        messageType,
                        newMessage,
                        attachmentCount,
                    )

                    // Then
                    expect(result?.message).toEqual(
                        `When using Twitter direct message, you can only send attachments one by one.`,
                    )
                })
            })
        })

        describe('canReply()', () => {
            it('should allow giving an explicit reason', () => {
                const replyOptions = new Map<string, any>()

                replyOptions.set(
                    'reason',
                    'reply blocked for an explicit reason',
                )

                expect(
                    canReply(
                        undefined,
                        TicketMessageSourceType.Email,
                        0,
                        true,
                        replyOptions,
                    ),
                ).toEqual({
                    message: 'reply blocked for an explicit reason',
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow replying from an unverified email integration', () => {
                expect(
                    canReply(
                        {
                            channel: 'email',
                            verified: false,
                            address: 'support@acme.com',
                            name: 'Acme Support',
                            displayName: 'Acme Support',
                        },
                        TicketMessageSourceType.Email,
                        0,
                        true,
                    ),
                ).toEqual({
                    message: (
                        <>
                            The email address <strong>support@acme.com</strong>
                            <strong> is not verified</strong>
                            <br />
                            <br />
                            To send a response, please go to Email Settings,
                            select your email and complete the outbound
                            verification process.
                            <br />
                            Once verified, you'll be able to communicate with
                            customers using this email.
                        </>
                    ),
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow replying from a deactivated integration', () => {
                expect(
                    canReply(
                        {
                            channel: 'whatsapp-message',
                            verified: true,
                            address: '+15550430560',
                            name: 'WhatsApp +15550430560',
                            displayName: 'WhatsApp +15550430560',
                            isDeactivated: true,
                        },
                        TicketMessageSourceType.Email,
                        0,
                        true,
                    ),
                ).toEqual({
                    message: (
                        <>
                            <strong>+15550430560</strong>
                            <strong> was disconnected</strong> due to a password
                            change, email provider outage, or other changes made
                            to your account
                            <br />
                            <br />
                            <Link
                                to={
                                    '/app/settings/integrations/whatsapp/integrations'
                                }
                            >
                                Reconnect
                            </Link>{' '}
                            the integration to respond to this customer.
                            <br />
                            <br />
                            <strong>Note</strong>: Login credentials may be
                            required to reconnect.
                        </>
                    ),
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow replying from a deactivated gmail/outlook integration (message for admin)', () => {
                const senderAddress = 'support@acme.com'
                expect(
                    canReply(
                        {
                            channel: 'email',
                            verified: true,
                            address: senderAddress,
                            name: 'Acme Support',
                            displayName: 'Acme Support',
                            isDeactivated: true,
                            reconnectUrl: '/test/reconnect/url',
                        },
                        TicketMessageSourceType.Email,
                        0,
                        true,
                    ),
                ).toEqual({
                    message: (
                        <>
                            Your email account {senderAddress} is disconnected.
                            Follow the steps in the reconnection email to
                            restore email access.
                            <br />
                            <br />
                            <a
                                href="/test/reconnect/url"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Reconnect Now
                            </a>
                        </>
                    ),
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow replying from a deactivated gmail/outlook integration (message for agent)', () => {
                const senderAddress = 'support@acme.com'
                expect(
                    canReply(
                        {
                            channel: 'email',
                            verified: true,
                            address: 'support@acme.com',
                            name: 'Acme Support',
                            displayName: 'Acme Support',
                            isDeactivated: true,
                            reconnectUrl: '/test/reconnect/url',
                        },
                        TicketMessageSourceType.Email,
                        0,
                        false,
                    ),
                ).toEqual({
                    message: (
                        <>
                            The email account {senderAddress} is disconnected.
                            Only the Account Owner or an Admin can reconnect it.
                            Please contact them for assistance.
                        </>
                    ),
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow replying to Instagram DM with attachments', () => {
                expect(
                    canReply(
                        {
                            channel: 'instagram',
                            verified: true,
                            address: 'acme',
                            name: 'Acme',
                            displayName: 'Acme',
                        },
                        TicketMessageSourceType.InstagramDirectMessage,
                        1,
                        true,
                    ),
                ).toEqual({
                    message:
                        'When using Instagram direct message, you can either send a text message, ' +
                        'or an image attachment, but not both at the same time. ' +
                        'If you want to write a message, remove the attachment first.',
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow replying to WhatsApp with attachments', () => {
                expect(
                    canReply(
                        {
                            channel: 'instagram',
                            verified: true,
                            address: 'acme',
                            name: 'Acme',
                            displayName: 'Acme',
                        },
                        TicketMessageSourceType.WhatsAppMessage,
                        1,
                        true,
                    ),
                ).toEqual({
                    message:
                        'When using Whatsapp message, you can either send a text message, ' +
                        'or an image attachment, but not both at the same time. ' +
                        'If you want to write a message, remove the attachment first.',
                    status: NotificationStatus.Warning,
                })
            })

            it('should not allow reply when integration is not available', () => {
                jest.spyOn(channelsService, 'isNewChannel').mockReturnValue(
                    true,
                )

                expect(
                    canReply(
                        undefined,
                        'tiktok-shop' as TicketMessageSourceType,
                        0,
                        true,
                    ),
                ).toEqual({
                    message: (
                        <>
                            You cannot answer to this ticket on this channel
                            because the associated integration does not exist.
                        </>
                    ),
                    status: NotificationStatus.Warning,
                })
            })
        })
    })
})
