import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import {EditorState, ContentState} from 'draft-js'
import _noop from 'lodash/noop'
//@ts-ignore
import generateRandomKey from 'draft-js/lib/generateRandomKey'

import {
    convertFromHTML,
    convertToHTML,
    createDraftJSKeyGeneratorMock,
} from 'utils/editor'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {sanitizeHtmlForFacebookMessenger} from 'utils/html'

import {FeatureFlagKey} from 'config/featureFlags'
import {TicketReplyEditorContainer} from '../TicketReplyEditor'

jest.mock('draft-js/lib/generateRandomKey', () =>
    jest.fn().mockReturnValue('mock-key')
)

describe('TicketReplyEditor component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const generateKey = createDraftJSKeyGeneratorMock()
        const generateRandomKeyFunction = generateRandomKey as jest.SpyInstance
        generateRandomKeyFunction.mockImplementation(generateKey)
    })

    const minProps: ComponentProps<typeof TicketReplyEditorContainer> = {
        applyMacro: jest.fn(),
        isNewMessagePublic: true,
        macros: fromJS([]),
        richAreaRef: jest.fn(),
        shouldDisplayQuickReply: false,
        ticket: fromJS({}),
        agents: fromJS([]),
        attachments: fromJS([]),
        newMessage: fromJS({}),
        newMessageType: fromJS({}),
        predictionContext: fromJS({}),
        addAttachments: jest.fn(),
        notify: jest.fn(),
        setResponseText: jest.fn(),
        flags: {
            [FeatureFlagKey.RevenueHideDiscountCodeButton]: false,
        },
    }

    it('should render empty ticket', () => {
        const component = shallow(
            <TicketReplyEditorContainer
                {...minProps}
                newMessage={fromJS({
                    state: {
                        contentState: ContentState.createFromText(''),
                    },
                    _internal: {
                        loading: {
                            submitMessage: false,
                        },
                    },
                    newMessage: {
                        body_text: '',
                        body_html: '',
                    },
                })}
                newMessageType={TicketMessageSourceType.Email}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not allow attachments for instagram comments', () => {
        const component = shallow(
            <TicketReplyEditorContainer
                {...minProps}
                newMessage={fromJS({
                    state: {
                        contentState: ContentState.createFromText(''),
                    },
                    _internal: {
                        loading: {
                            submitMessage: false,
                        },
                    },
                    newMessage: {
                        body_text: '',
                        body_html: '',
                    },
                })}
                newMessageType={TicketMessageSourceType.InstagramComment}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not allow attachments for instagram mentions', () => {
        const component = shallow(
            <TicketReplyEditorContainer
                {...minProps}
                newMessage={fromJS({
                    state: {
                        contentState: ContentState.createFromText(''),
                    },
                    _internal: {
                        loading: {
                            submitMessage: false,
                        },
                    },
                    newMessage: {
                        body_text: '',
                        body_html: '',
                    },
                })}
                newMessageType={TicketMessageSourceType.InstagramMention}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it.each([
        // Simulate having an existing GIF and adding a new attachment
        [fromJS([{content_type: 'image/gif'}]), [{type: 'image/jpg'}]],
        // Simulate having an existing attachment and adding a new GIF one
        [fromJS([{content_type: 'image/jpg'}]), [{type: 'image/gif'}]],
    ])(
        'should not allow GIF + other attachments for Twitter tweets',
        (existingAttachments, newAttachments) => {
            const notifyMock = jest.fn()

            const component = shallow<TicketReplyEditorContainer>(
                <TicketReplyEditorContainer
                    {...minProps}
                    addAttachments={_noop}
                    newMessage={fromJS({
                        state: {
                            contentState: ContentState.createFromText(''),
                        },
                        _internal: {
                            loading: {
                                submitMessage: false,
                            },
                        },
                        newMessage: {
                            body_text: '',
                            body_html: '',
                        },
                    })}
                    attachments={existingAttachments}
                    newMessageType={TicketMessageSourceType.TwitterTweet}
                    notify={notifyMock}
                />
            )

            // Simulate adding new file
            component.instance().handleFiles(newAttachments as File[])

            expect(notifyMock).toBeCalledWith({
                type: 'error',
                status: 'warning',
                message:
                    'When answering to Twitter tweet messages, you can only attach a single GIF or a maximum of 4 pictures.',
            })
        }
    )

    // test for debouncer bug
    // https://github.com/gorgias/gorgias/issues/2510
    it('should not set newMessage value after component is unmounted', (done) => {
        const ticket: Map<any, any> = fromJS({
            id: 123,
            events: [],
            messages: [],
            subject: 'Pepperoni Pizza',
            via: 'helpdesk',
            channel: 'email',
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null,
        })

        const newMessage: Map<any, any> = fromJS({
            state: {
                contentState: ContentState.createFromText(''),
                selectionState: null,
                cacheAdded: true,
            },
            newMessage: {
                body_text: '',
                body_html: '',
            },
        })
        let newMessageText: string

        const component = shallow<TicketReplyEditorContainer>(
            <TicketReplyEditorContainer
                {...minProps}
                newMessageType={TicketMessageSourceType.Email}
                newMessage={newMessage}
                ticket={ticket}
                setResponseText={(props) => {
                    newMessageText = (
                        props!.get('contentState') as ContentState
                    ).getPlainText()
                }}
                shouldDisplayQuickReply={false}
            />
        )

        // simulate RichField change event
        const editorState = EditorState.createWithContent(
            ContentState.createFromText('Pizza Pepperoni')
        )
        component.instance().onEditorChange(editorState)
        // simulate leaving ticket
        component.unmount()
        // simulate blank newMessage
        newMessageText = ''

        // needed for lifecycle
        setTimeout(() => {
            // Jest will throw an Timeout error if it fails
            // because expect throw()s
            expect(newMessageText).toBe('')
            done()
        }, 500)
    })

    it('should allow inline image', (done) => {
        const ticket: Map<any, any> = fromJS({
            id: 123,
            events: [],
            messages: [],
            subject: 'Pepperoni Pizza',
            via: 'helpdesk',
            channel: TicketChannel.FacebookMessenger,
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null,
        })

        const newMessage: Map<any, any> = fromJS({
            state: {
                contentState: ContentState.createFromText(''),
                selectionState: null,
                cacheAdded: true,
            },
            newMessage: {
                body_text: '',
                body_html: '',
            },
        })

        const component = shallow(
            <TicketReplyEditorContainer
                {...minProps}
                newMessageType={TicketMessageSourceType.FacebookMessenger}
                newMessage={newMessage}
                ticket={ticket}
            />
        )

        // needed for lifecycle
        setTimeout(() => {
            // Jest will throw an Timeout error if it fails
            // because expect throw()s
            expect(component).toMatchSnapshot()
            done()
        }, 500)
    })

    it('should render message with inline image', (done) => {
        const ticket: Map<any, any> = fromJS({
            id: 123,
            events: [],
            messages: [],
            subject: 'Pepperoni Pizza',
            via: 'helpdesk',
            channel: TicketChannel.FacebookMessenger,
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null,
        })

        const newMessage: Map<any, any> = fromJS({
            state: {
                contentState: null,
                selectionState: null,
                cacheAdded: true,
            },
            newMessage: {
                body_text: '',
                body_html: '',
            },
        })
        let newEditorState: ContentState

        const component = shallow<TicketReplyEditorContainer>(
            <TicketReplyEditorContainer
                {...minProps}
                newMessageType={TicketMessageSourceType.Aircall}
                newMessage={newMessage}
                ticket={ticket}
                setResponseText={(props) => {
                    newEditorState = props!.get('contentState')
                }}
            />
        )

        let htmlString = `<b>this is an</b> inline image: <img alt="abc" src="https://this-is-a-link-of-image/and-this-is-the-image.png">`
        htmlString = sanitizeHtmlForFacebookMessenger(htmlString)

        // simulate RichField change event
        const editorState = EditorState.createWithContent(
            convertFromHTML(htmlString)
        )
        component.instance().onEditorChange(editorState)

        // needed for lifecycle
        setTimeout(() => {
            expect(convertToHTML(newEditorState)).toMatchSnapshot()
            done()
        }, 500)
    })
})
