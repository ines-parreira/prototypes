import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {EditorState, ContentState} from 'draft-js'
import _noop from 'lodash/noop'
import generateRandomKey from 'draft-js/lib/generateRandomKey'

import {TicketReplyEditorContainer} from '../TicketReplyEditor'
import {
    convertFromHTML,
    convertToHTML,
    createDraftJSKeyGeneratorMock,
} from '../../../../../../utils/editor.tsx'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../../../../business/types/ticket'
import {sanitizeHtmlForFacebookMessenger} from '../../../../../../utils/html.ts'

jest.mock('draft-js/lib/generateRandomKey', () =>
    jest.fn().mockReturnValue('mock-key')
)

describe('TicketReplyEditor component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const generateKey = createDraftJSKeyGeneratorMock()
        generateRandomKey.mockImplementation(generateKey)
    })

    it('should render empty ticket', () => {
        const component = shallow(
            <TicketReplyEditorContainer
                actions={{}}
                ticket={fromJS({})}
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
                newMessageType={TicketChannel.Email}
                agents={fromJS([])}
                notify={jest.fn()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    // test for debouncer bug
    // https://github.com/gorgias/gorgias/issues/2510
    it('should not set newMessage value after component is unmounted', (done) => {
        const ticket = fromJS({
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

        const newMessage = fromJS({
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
        let newMessageText = ''

        let component = shallow(
            <TicketReplyEditorContainer
                newMessageType="email"
                newMessage={newMessage}
                agents={[]}
                actions={{}}
                ticket={ticket}
                addAttachments={_noop}
                notify={_noop}
                setMacrosVisible={_noop}
                prepareNewMessage={_noop}
                setResponseText={(props) => {
                    newMessageText = props.get('contentState').getPlainText()
                }}
            />
        )

        // simulate RichField change event
        const editorState = EditorState.createWithContent(
            ContentState.createFromText('Pizza Pepperoni')
        )
        component.instance()._onEditorChange(editorState)
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
        const ticket = fromJS({
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

        const newMessage = fromJS({
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

        let component = shallow(
            <TicketReplyEditorContainer
                newMessageType={TicketMessageSourceType.FacebookMessenger}
                newMessage={newMessage}
                agents={[]}
                actions={{}}
                ticket={ticket}
                addAttachments={_noop}
                notify={_noop}
                setMacrosVisible={_noop}
                prepareNewMessage={_noop}
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
        const ticket = fromJS({
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

        const newMessage = fromJS({
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
        let newEditorState = ''

        let component = shallow(
            <TicketReplyEditorContainer
                newMessageType={TicketMessageSourceType.Aircall}
                newMessage={newMessage}
                agents={[]}
                actions={{}}
                ticket={ticket}
                addAttachments={_noop}
                notify={_noop}
                setMacrosVisible={_noop}
                prepareNewMessage={_noop}
                setResponseText={(props) => {
                    newEditorState = props.get('contentState')
                }}
            />
        )

        let htmlString = `<b>this is an</b> inline image: <img alt="abc" src="https://this-is-a-link-of-image/and-this-is-the-image.png">`
        htmlString = sanitizeHtmlForFacebookMessenger(htmlString)

        // simulate RichField change event
        const editorState = EditorState.createWithContent(
            convertFromHTML(htmlString)
        )
        component.instance()._onEditorChange(editorState)

        // needed for lifecycle
        setTimeout(() => {
            const expectedValue = `<div>this is an inline image: </div><figure style="display:inline-block;margin:0"><img src="https://this-is-a-link-of-image/and-this-is-the-image.png" width="400px" style="max-width: 100%"></figure>`
            expect(convertToHTML(newEditorState)).toBe(expectedValue)
            done()
        }, 500)
    })
})
