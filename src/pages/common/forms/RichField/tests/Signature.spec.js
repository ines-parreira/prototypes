import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {EditorState} from 'draft-js'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

import {TicketMessageSourceTypes} from '../../../../../business/ticket'
import Signature from '../Signature'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('Signature', () => {
    let editorState
    let initialState
    const emailAddress = 'support@acme.gorgias.io'
    const newMessage = fromJS({
        newMessage: {
            source: {
                type: 'email',
                from: {
                    address: emailAddress
                }
            }
        }
    })

    beforeEach(() => {
        editorState = EditorState.createEmpty()
        initialState = {
            integrations: fromJS({
                integrations: [{
                    type: 'gmail',
                    meta: {
                        address: emailAddress,
                        preferred: true,
                        signature: {
                            text: 'cheers, {{current_user.first_name}}',
                            html: 'cheers, <strong>{{current_user.first_name}}</strong>'
                        }
                    },
                }]
            }),
            currentUser: fromJS({
                first_name: 'Steve',
            }),
            newMessage,
            ticket: fromJS({})
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
        initialState.newMessage = initialState.newMessage.setIn(['newMessage', 'source', 'type'], TicketMessageSourceTypes.CHAT)

        const component = shallow(
            <Signature
                store={mockStore(initialState)}
                editorState={editorState}
            />
        )

        expect(component.html()).toBe('')
    })

    it('should not render when no signature set', () => {
        initialState.newMessage = initialState.newMessage.setIn(['newMessage', 'source', 'from'], fromJS({
            address: 'unknonw@acme.gorgias.io'
        }))
        initialState.currentUser = fromJS({})

        const component = shallow(
            <Signature
                store={mockStore(initialState)}
                editorState={editorState}
            />
        )

        expect(component.html()).toBe('')
    })

    it('should render with only text signature', () => {
        initialState.integrations = initialState.integrations.setIn(['integrations', 0, 'meta', 'signature'], fromJS({
            text: 'cheers, {{current_user.first_name}}'
        }))

        const component = shallow(
            <Signature
                store={mockStore(initialState)}
                editorState={editorState}
            />
        )

        expect(component.dive().find('Ellipsis').exists()).toBe(true)
    })

    it('should render with only html signature', () => {
        initialState.integrations = initialState.integrations.setIn(['integrations', 0, 'meta', 'signature'], fromJS({
            html: 'cheers, {{current_user.first_name}}'
        }))

        const component = shallow(
            <Signature
                store={mockStore(initialState)}
                editorState={editorState}
            />
        )

        expect(component.dive().find('Ellipsis').exists()).toBe(true)
    })
})
