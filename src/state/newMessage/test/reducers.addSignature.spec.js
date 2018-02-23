// separate tests needed for NEW_MESSAGE_ADD_SIGNATURE,
// because when draft-js/lib/generateRandomKey is mocked
// draft-convert removes newlines in convertFromHTML and convertFromText
// resulting html and text.
import {fromJS} from 'immutable'
import {ContentState} from 'draft-js'
import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import {convertToHTML} from '../../../utils'

describe('New message reducers', () => {
    describe('NEW_MESSAGE_ADD_SIGNATURE action', () => {
        let action
        let body_text
        let body_html
        beforeEach(() => {
            action = {
                type: types.NEW_MESSAGE_ADD_SIGNATURE,
                state: initialState,
                args: fromJS({
                    contentState: ContentState.createFromText('Hello')
                }),
                currentUser: fromJS({
                    signature_text: 'Cruel World!',
                    signature_html: '<a href="#">Cruel World!</a>',
                })
            }

            body_text = 'Hello\n\nCruel World!'
            body_html = '<div>Hello</div><br><div><a href=\"about:blank#\" target=\"_blank\">Cruel World!</a></div>'
        })

        it('should match the contentState plain text', () => {
            expect(reducer(initialState, action).getIn(['state', 'contentState']).getPlainText()).toBe(body_text)
        })

        it('should match the contentState html', () => {
            expect(convertToHTML(reducer(initialState, action).getIn(['state', 'contentState']))).toBe(body_html)
        })

        it('should add signature to body_text', () => {
            expect(reducer(initialState, action).getIn(['newMessage', 'body_text'])).toBe(body_text)
        })

        it('should add signature to body_html', () => {
            expect(reducer(initialState, action).getIn(['newMessage', 'body_html'])).toBe(body_html)
        })
    })
})
