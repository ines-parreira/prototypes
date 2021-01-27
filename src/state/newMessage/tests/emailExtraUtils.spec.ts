import {fromJS} from 'immutable'
import {ContentState} from 'draft-js'

import {ticket} from '../../../fixtures/ticket'
import {
    TicketEvent,
    TicketMessage,
    TicketSatisfactionSurvey,
} from '../../../models/ticket/types'
import {getContentStateBlocksSnapshot} from '../../../utils/editor'
import {
    addEmailExtraContent,
    EmailExtraArgs,
    getReplyThreadMessages,
    hasOnlySignatureText,
    isSignatureTextAdded,
    deleteEmailExtraContent,
    ReplyThreadMessage,
    Signature,
    getEmailExtraContent,
    clearEmailExtraData,
    hasEmailExtraContent,
} from '../emailExtraUtils'

describe('emailExtraUtils', () => {
    describe('isSignatureTextAdded', () => {
        const signature = fromJS({
            text: 'Signature',
        }) as Signature

        it('should return true if signature is in the content', () => {
            expect(
                isSignatureTextAdded(
                    ContentState.createFromText('Foo\n\nSignature'),
                    signature
                )
            ).toBe(true)
        })

        it('should return false if signature is not in the content', () => {
            expect(
                isSignatureTextAdded(
                    ContentState.createFromText('Foo'),
                    signature
                )
            ).toBe(false)
        })

        it('should return false if no signature has not text', () => {
            expect(
                isSignatureTextAdded(
                    ContentState.createFromText('Foo\n\nSignature'),
                    signature.delete('text')
                )
            ).toBe(false)
        })
    })

    describe('hasOnlySignatureText', () => {
        const signature = fromJS({
            text: 'Signature',
        }) as Signature

        it('should return false if signature is not the only content', () => {
            expect(
                hasOnlySignatureText(
                    ContentState.createFromText('Foo\nSignature'),
                    signature
                )
            ).toBe(false)
        })

        it('should return false if signature has no text', () => {
            expect(
                hasOnlySignatureText(
                    ContentState.createFromText('\n\nSignature'),
                    signature.delete('text')
                )
            ).toBe(false)
        })

        it('should return true if signature is the only content', () => {
            expect(
                hasOnlySignatureText(
                    ContentState.createFromText('\n\nSignature'),
                    signature
                )
            ).toBe(true)
        })
    })

    describe('getReplyThreadMessages', () => {
        const messageFixture = ticket.messages[0] as TicketMessage

        it('should filter out non-messages', () => {
            const message = {...messageFixture}
            delete message.isMessage
            const event: TicketEvent = {
                ...message,
                isEvent: true,
            }
            const survey: TicketSatisfactionSurvey = {
                ...message,
                isSatisfactionSurvey: true,
            }
            expect(getReplyThreadMessages([event, survey])).toEqual([])
        })

        it('should filter out unsent messages', () => {
            expect(
                getReplyThreadMessages([
                    {
                        ...messageFixture,
                        sent_datetime: undefined,
                    },
                ])
            ).toEqual([])
        })

        it('should filter out private messages', () => {
            expect(
                getReplyThreadMessages([
                    {
                        ...messageFixture,
                        public: false,
                    },
                ])
            ).toEqual([])
        })

        it('should sort the messages by sent time desc', () => {
            const oldest_message = {
                ...messageFixture,
                sent_datetime: '2010-01-01T12:23:34.000Z',
            }
            const middle_message = {
                ...messageFixture,
                sent_datetime: '2013-07-05T09:31:55.000Z',
            }
            const newest_message = {
                ...messageFixture,
                sent_datetime: '2015-05-01T17:12:34.000Z',
            }
            expect(
                getReplyThreadMessages([
                    middle_message,
                    oldest_message,
                    newest_message,
                ])
            ).toEqual([newest_message, middle_message, oldest_message])
        })
    })

    describe('addEmailExtraContent', () => {
        const signature = fromJS({
            text: 'Foo signature',
            html: 'Foo <b>signature</b>',
        }) as Signature
        const replyThreadMessages = [ticket.messages[0]] as ReplyThreadMessage[]
        const emailExtraArgs: EmailExtraArgs = {
            ticket,
            signature,
            replyThreadMessages,
            isForwarded: false,
        }

        const createLongMessageLines = (
            linesCount: number,
            wordsPerLine: number
        ): string[] => {
            return Array.from(Array(linesCount).keys()).map((blockIndex) => {
                return Array.from(Array(wordsPerLine).keys())
                    .map((wordIndex) => {
                        return `line_${blockIndex + 1}_word_${wordIndex + 1}`
                    })
                    .join(' ')
            })
        }

        it('should not add email extra if signature and reply thread are empty', () => {
            const contentState = ContentState.createFromText('')
            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({}),
                replyThreadMessages: [],
            })
            expect(newContentState).toBe(contentState)
        })

        it('should not add the signature if signature has no text', () => {
            const contentState = ContentState.createFromText('')
            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({
                    text: '',
                    html: '<div><br></div>',
                }),
                replyThreadMessages: [],
            })
            expect(newContentState).toBe(contentState)
        })

        it('should add the signature below the response', () => {
            const contentState = ContentState.createFromText('Response content')
            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                replyThreadMessages: [],
            })
            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should not add the signature if the signature is in the content', () => {
            const contentState = ContentState.createFromText(
                'Hello\n\nFoo signature'
            )
            const newContentState = addEmailExtraContent(
                contentState,
                emailExtraArgs
            )
            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should add the reply thread below the response', () => {
            const contentState = ContentState.createFromText('Response content')
            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({}),
            })
            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should add the signature and reply thread below the response', () => {
            const contentState = ContentState.createFromText('Response content')
            const newContentState = addEmailExtraContent(
                contentState,
                emailExtraArgs
            )
            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should parse the sent_datetime timezone and format header using the same timezone', () => {
            const sent_datetime = '2020-12-14T11:06:34.154809+02:00'
            const contentState = ContentState.createFromText('Foo')
            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({}),
                replyThreadMessages: [
                    {
                        ...replyThreadMessages[0],
                        sent_datetime,
                    },
                ],
            })
            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should display sender name in the header when source is not defined', () => {
            const contentState = ContentState.createFromText('Foo')
            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({}),
                replyThreadMessages: [
                    {
                        ...replyThreadMessages[0],
                        source: undefined,
                    },
                ],
            })
            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should display stripped_html and fallback to body_html, stripped_text, body_text in the message body', () => {
            const contentState = ContentState.createFromText('Foo')
            const message = {
                ...replyThreadMessages[0],
                stripped_html: 'Stripped HTML',
                stripped_text: 'Stripped Text',
                body_html: 'Body HTML',
                body_text: 'Body Text',
            }

            expect(
                addEmailExtraContent(contentState, {
                    ...emailExtraArgs,
                    replyThreadMessages: [message],
                }).getPlainText()
            ).toMatch('Stripped HTML')

            expect(
                addEmailExtraContent(contentState, {
                    ...emailExtraArgs,
                    replyThreadMessages: [
                        {
                            ...message,
                            stripped_html: null,
                        },
                    ],
                }).getPlainText()
            ).toMatch('Body HTML')

            expect(
                addEmailExtraContent(contentState, {
                    ...emailExtraArgs,
                    replyThreadMessages: [
                        {
                            ...message,
                            stripped_html: null,
                            body_html: undefined,
                        },
                    ],
                }).getPlainText()
            ).toMatch('Stripped Text')

            expect(
                addEmailExtraContent(contentState, {
                    ...emailExtraArgs,
                    replyThreadMessages: [
                        {
                            ...message,
                            stripped_html: null,
                            body_html: undefined,
                            stripped_text: null,
                        },
                    ],
                }).getPlainText()
            ).toMatch('Body Text')
        })

        it('should add the forwarded message header to a forwarded message', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('User response'),
                {
                    ...emailExtraArgs,
                    signature: fromJS({}),
                    isForwarded: true,
                    replyThreadMessages: [
                        {
                            ...ticket.messages[0],
                            stripped_html: 'First message',
                        },
                        {
                            ...ticket.messages[0],
                            stripped_html: 'Second message',
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should render the forwarded message header to a nested forwarded messages', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('User response'),
                {
                    ...emailExtraArgs,
                    signature: fromJS({}),
                    replyThreadMessages: [
                        {
                            ...replyThreadMessages[0],
                            stripped_html: 'First message (forwarded)',
                            source: {
                                ...replyThreadMessages[0].source,
                                extra: {
                                    forward: true,
                                },
                            },
                        },
                        {
                            ...replyThreadMessages[0],
                            stripped_html: 'Second message (forwarded)',
                            source: {
                                ...replyThreadMessages[0].source,
                                extra: {
                                    forward: true,
                                },
                            },
                        },
                        {
                            ...replyThreadMessages[0],
                            stripped_html: 'Third message',
                        },
                        {
                            ...replyThreadMessages[0],
                            stripped_html: 'Fourth message',
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should limit the number of reply thread messages', () => {
            const messagesCountLimit = 1
            const contentState = ContentState.createFromText('User response')
            const replyThreadMessages = Array.from(
                Array(messagesCountLimit + 1).keys()
            ).map((i) => {
                return {
                    ...ticket.messages[0],
                    stripped_html: `Message #${i + 1}`,
                }
            }) as ReplyThreadMessage[]

            const newContentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({}),
                replyThreadMessages,
                messagesCountLimit,
            })

            expect(
                getContentStateBlocksSnapshot(newContentState)
            ).toMatchSnapshot()
        })

        it('should limit reply blocks', () => {
            const replyBlocksCountLimit = 5
            const contentState = addEmailExtraContent(
                ContentState.createFromText('User response'),
                {
                    ...emailExtraArgs,
                    replyBlocksCountLimit,
                    signature: fromJS({}),
                    replyThreadMessages: [
                        {
                            ...ticket.messages[0],
                            stripped_html: createLongMessageLines(
                                replyBlocksCountLimit,
                                1
                            ).join('<br>'),
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should show at least first 3 words of the entirely trimmed message', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText(
                    createLongMessageLines(1, 1).join('\n')
                ),
                {
                    ...emailExtraArgs,
                    signature: fromJS({}),
                    replyBlocksCountLimit: 3,
                    replyThreadMessages: [
                        {
                            ...ticket.messages[0],
                            stripped_html: createLongMessageLines(1, 4).join(
                                '<br>'
                            ),
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should limit reply words', () => {
            const replyWordsCountLimit = 20
            const contentState = addEmailExtraContent(
                ContentState.createFromText(
                    createLongMessageLines(1, 1).join('\n')
                ),
                {
                    ...emailExtraArgs,
                    signature: fromJS({}),
                    replyWordsCountLimit,
                    replyThreadMessages: [
                        {
                            ...ticket.messages[0],
                            stripped_html: createLongMessageLines(
                                1,
                                replyWordsCountLimit
                            ).join('<br>'),
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should not render the limited reply thread indicator if the blocks count equals the limit', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo'),
                {
                    ...emailExtraArgs,
                    signature: fromJS({}),
                    replyBlocksCountLimit: 4,
                    replyThreadMessages: [
                        {
                            ...ticket.messages[0],
                            stripped_html: createLongMessageLines(1, 5).join(
                                '<br>'
                            ),
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should not render the limited reply thread indicator if the words count equals the limit', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo'),
                {
                    ...emailExtraArgs,
                    signature: fromJS({}),
                    replyWordsCountLimit: 20,
                    replyThreadMessages: [
                        {
                            ...ticket.messages[0],
                            stripped_html: createLongMessageLines(1, 7).join(
                                '<br>'
                            ),
                        },
                    ] as ReplyThreadMessage[],
                }
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })
    })

    describe('deleteEmailExtraContent', () => {
        const signature = fromJS({
            text: 'Foo signature',
            html: 'Foo <b>signature</b>',
        })
        const replyThreadMessages = [ticket.messages[0]] as ReplyThreadMessage[]
        const emailExtraArgs: EmailExtraArgs = {
            ticket,
            signature,
            replyThreadMessages,
            isForwarded: false,
        }

        it('should return the same content state if there is no email extra in the response', () => {
            const contentState = ContentState.createFromText('Foo bar')
            const newContentState = deleteEmailExtraContent(contentState)
            expect(newContentState).toBe(contentState)
        })

        it('should remove the signature from the response', () => {
            let contentState = ContentState.createFromText('Foo\nBar')
            contentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                replyThreadMessages: [],
            })
            contentState = deleteEmailExtraContent(contentState)
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should remove the reply thread from the response', () => {
            let contentState = ContentState.createFromText('Foo\nBar')
            contentState = addEmailExtraContent(contentState, {
                ...emailExtraArgs,
                signature: fromJS({}),
            })
            contentState = deleteEmailExtraContent(contentState)
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should remove the signature and the reply thread from the response', () => {
            let contentState = ContentState.createFromText('Foo\nBar')
            contentState = addEmailExtraContent(contentState, emailExtraArgs)
            contentState = deleteEmailExtraContent(contentState)
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should return an empty text when email extra is the only content', () => {
            let contentState = ContentState.createFromText('Foo')
            contentState = addEmailExtraContent(contentState, emailExtraArgs)
            contentState = ContentState.createFromBlockArray(
                contentState.getBlocksAsArray().slice(1)
            )
            contentState = deleteEmailExtraContent(contentState)
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })
    })

    describe('getEmailExtraContent', () => {
        it('should return empty content state when there is no email extra', () => {
            const contentState = ContentState.createFromText('Foo bar')
            expect(
                getEmailExtraContent(contentState).getBlocksAsArray()
            ).toEqual([])
        })

        it('should return email extra content state', () => {
            let contentState = ContentState.createFromText('Foo\nBar')
            contentState = addEmailExtraContent(contentState, {
                ticket,
                signature: fromJS({text: 'Signature', html: 'Signature'}),
                replyThreadMessages: [
                    ticket.messages[0],
                ] as ReplyThreadMessage[],
                isForwarded: false,
            })
            contentState = getEmailExtraContent(contentState)
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })
    })

    describe('clearEmailExtraData', () => {
        it('should return the same content state if there is no email extra', () => {
            const contentState = ContentState.createFromText('Foo')
            const cleanContentSate = clearEmailExtraData(contentState)
            expect(cleanContentSate).toBe(contentState)
        })

        it('should clear email extra data', () => {
            let contentState = ContentState.createFromText('Foo\nBar')
            contentState = addEmailExtraContent(contentState, {
                ticket,
                signature: fromJS({text: 'Signature', html: 'Signature'}),
                replyThreadMessages: [
                    ticket.messages[0],
                ] as ReplyThreadMessage[],
                isForwarded: false,
            })
            contentState = clearEmailExtraData(contentState)
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should preserve the selection states', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo\nBar'),
                {
                    ticket,
                    signature: fromJS({}),
                    replyThreadMessages: [
                        ticket.messages[0],
                    ] as ReplyThreadMessage[],
                    isForwarded: false,
                }
            )
            const cleanContentState = clearEmailExtraData(contentState)
            expect(cleanContentState.getSelectionBefore()).toEqual(
                contentState.getSelectionBefore()
            )
            expect(cleanContentState.getSelectionAfter()).toEqual(
                contentState.getSelectionAfter()
            )
        })
    })

    describe('hasEmailExtraContent', () => {
        it('should return false when content state does not contain email extra', () => {
            expect(
                hasEmailExtraContent(ContentState.createFromText('Foo'))
            ).toBe(false)
        })

        it('should return true when content state contains email extra', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo\nBar'),
                {
                    ticket,
                    signature: fromJS({}),
                    replyThreadMessages: [
                        ticket.messages[0],
                    ] as ReplyThreadMessage[],
                    isForwarded: false,
                }
            )
            expect(hasEmailExtraContent(contentState)).toBe(true)
        })
    })
})
