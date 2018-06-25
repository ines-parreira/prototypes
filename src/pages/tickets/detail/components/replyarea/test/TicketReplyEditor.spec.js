import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {EditorState, ContentState} from 'draft-js'
import _noop from 'lodash/noop'

import configureStore from '../../../../../../store/configureStore'
import ConnectedTicketReplyEditor from '../TicketReplyEditor'
import {TicketReplyEditor} from '../TicketReplyEditor'

describe('TicketReplyEditor component', () => {
    it('should render empty ticket', () => {
        const component = shallow(
            <ConnectedTicketReplyEditor
                store={configureStore()}
                actions={{}}
                ticket={fromJS({})}
            />
        ).dive() // dive in connect()ed component
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
            trashed_datetime: null
        })

        const newMessage = fromJS({
            state: {
                contentState: null,
                selectionState: null,
                cacheAdded: true
            },
            newMessage: {
                body_text: '',
                body_html: ''
            }
        })
        let newMessageText = ''

        let component = shallow(
            <TicketReplyEditor
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
        const editorState = EditorState.createWithContent(ContentState.createFromText('Pizza Pepperoni'))
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
})
