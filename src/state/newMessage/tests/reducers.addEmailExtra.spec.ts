// separate tests needed for NEW_MESSAGE_ADD_EMAIL_EXTRA,
// because when draft-js/lib/generateRandomKey is mocked
// draft-convert removes newlines in convertFromHTML and convertFromText
// resulting html and text.
import {fromJS, Map} from 'immutable'
import {ContentState} from 'draft-js'

import reducer, {initialState} from '../reducers'
import {
    convertToHTML,
    getContentStateBlocksSnapshot,
} from '../../../utils/editor'
import {ticket} from '../../../fixtures/ticket'
import {ReplyThreadMessage} from '../emailExtraUtils'
import {addEmailExtra} from '../actions'

describe('new message reducer', () => {
    describe('NEW_MESSAGE_ADD_EMAIL_EXTRA action', () => {
        const contentState = ContentState.createFromText('Hello')
        const state = initialState
            .setIn(['state', 'contentState'], contentState)
            .setIn(['newMessage', 'body_html'], convertToHTML(contentState))
            .setIn(['newMessage', 'body_text'], contentState.getPlainText())
        const signature = fromJS({
            text: 'Foo signature',
            html: 'Foo <b>signature</b>',
        })
        const replyThreadMessages = [ticket.messages[0]] as ReplyThreadMessage[]
        const emailExtraArgs = {
            ticket,
            signature,
            replyThreadMessages,
            isForwarded: false,
        }
        const defaultActionPayload: ReturnType<
            typeof addEmailExtra
        >['payload'] = {
            contentState,
            emailExtraArgs,
        }

        const getStateSnapshot = (state: Map<any, any>) => {
            const snapshot = state.toJS() as {state: Record<string, unknown>}
            snapshot.state.contentState = getContentStateBlocksSnapshot(
                state.getIn(['state', 'contentState'])
            )
            return snapshot
        }

        it('should add email extra content', () => {
            const newState = reducer(state, addEmailExtra(defaultActionPayload))
            expect(getStateSnapshot(newState)).toMatchSnapshot()
        })

        it('should not add the email extra content if it is already added', () => {
            const newState = reducer(
                state.setIn(['state', 'emailExtraAdded'], true),
                addEmailExtra({
                    ...defaultActionPayload,
                    emailExtraArgs: {
                        ...emailExtraArgs,
                        replyThreadMessages,
                    },
                })
            )
            expect(getStateSnapshot(newState)).toMatchSnapshot()
        })
    })
})
