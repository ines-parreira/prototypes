import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {EditorState} from 'draft-js'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

import Signature from '../Signature'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('Signature', () => {
    let editorState
    let initialState
    const currentUser = fromJS({
        signature_text: 'Text Signature',
        signature_html: '<a href="#">Text Signature</a>'
    })
    const newMessage = fromJS({
        newMessage: {
            source: {
                type: 'email'
            }
        }
    })

    beforeEach(() => {
        editorState = EditorState.createEmpty()
        initialState = {
            currentUser,
            newMessage
        }
    })

    it('should render the signature button', () => {
        const component = shallow(
            <Signature
                store={mockStore(initialState)}
                editorState={editorState}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not render for messageType other than email', () => {
        const component = shallow(
            <Signature
                store={mockStore({
                    currentUser,
                    newMessage: newMessage.setIn(['newMessage', 'source', 'type'], 'random')
                })}
                editorState={editorState}
            />
        )

        expect(component.html()).toBe('')
    })

    it('should not render when no signature set', () => {
        const component = shallow(
            <Signature
                store={mockStore({
                    newMessage,
                    currentUser: currentUser.merge({
                        signature_text: '',
                        signature_html: '',
                    }),
                })}
                editorState={editorState}
            />
        )

        expect(component.html()).toBe('')
    })

    it('should render with only text signature', () => {
        const component = shallow(
            <Signature
                store={mockStore({
                    newMessage,
                    currentUser: currentUser.merge({
                        signature_text: 'Text signature',
                        signature_html: '',
                    }),
                })}
                editorState={editorState}
            />
        )

        expect(component.dive().find('button').exists()).toBe(true)
    })

    it('should render with only html signature', () => {
        const component = shallow(
            <Signature
                store={mockStore({
                    newMessage,
                    currentUser: currentUser.merge({
                        signature_text: '',
                        signature_html: '<img src="" />',
                    }),
                })}
                editorState={editorState}
            />
        )

        expect(component.dive().find('button').exists()).toBe(true)
    })
})
