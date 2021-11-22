import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, List} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {RootState} from '../../types'

jest.addMatchers(immutableMatchers)

describe('new message selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            newMessage: initialState,
        } as RootState
    })

    describe('isForwarded()', () => {
        it('should detect forwarded message', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'source', 'extra', 'forward'],
                true
            )
            expect(selectors.isForward(state)).toEqual(true)
        })

        it('should not detect forwarded message', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'source', 'type'],
                'email'
            )
            expect(selectors.isForward(state)).toEqual(false)
        })
    })

    describe('isReady()', () => {
        it('should be ready (reply with body)', () => {
            state.newMessage = state.newMessage
                .setIn(['newMessage', 'body_text'], 'Hello World')
                .setIn(
                    ['newMessage', 'source', 'to', 0],
                    fromJS({address: 'support@acme.gorgias.io'})
                )
            expect(selectors.isReady(state)).toEqual(true)
        })

        it('should be ready (reply with attachments)', () => {
            state.newMessage = state.newMessage
                .setIn(['newMessage', 'attachments'], List([{}]))
                .setIn(
                    ['newMessage', 'source', 'to', 0],
                    fromJS({address: 'support@acme.gorgias.io'})
                )
            expect(selectors.isReady(state)).toEqual(true)
        })

        it('should be ready (forward with message)', () => {
            state.newMessage = state.newMessage
                .setIn(['newMessage', 'body_text'], 'Hello World')
                .setIn(['newMessage', 'source', 'extra', 'forward'], true)
                .setIn(
                    ['newMessage', 'source', 'to', 0],
                    fromJS({address: 'support@acme.gorgias.io'})
                )
            expect(selectors.isReady(state)).toEqual(true)
        })

        it('should be ready (forward without message)', () => {
            state.newMessage = state.newMessage
                .setIn(['newMessage', 'body_text'], '')
                .setIn(['newMessage', 'source', 'extra', 'forward'], true)
                .setIn(
                    ['newMessage', 'source', 'to', 0],
                    fromJS({address: 'support@acme.gorgias.io'})
                )
            expect(selectors.isReady(state)).toEqual(true)
        })

        it('should be ready (private message)', () => {
            state.newMessage = state.newMessage
                .setIn(['newMessage', 'body_text'], 'Hello world!')
                .setIn(['newMessage', 'public'], false)
                .setIn(['newMessage', 'source', 'to'], fromJS([]))
            expect(selectors.isReady(state)).toEqual(true)
        })

        it('should not be ready (reply without recipients)', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'body_text'],
                'Hello World'
            )
            expect(selectors.isReady(state)).toEqual(false)
        })

        it('should not be ready (reply without message and attachments)', () => {
            state.newMessage = state.newMessage
                .setIn(['newMessage', 'attachments'], null)
                .setIn(
                    ['newMessage', 'source', 'to', 0],
                    fromJS({address: 'support@acme.gorgias.io'})
                )
            expect(selectors.isReady(state)).toEqual(false)
        })

        it('should not be ready (forward without recipients)', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'subject'],
                'Fwd: Hello world!'
            )
            expect(selectors.isReady(state)).toEqual(false)
        })
        it('should not be ready (private message without message)', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'source', 'type'],
                'internal-note'
            )
            expect(selectors.isReady(state)).toEqual(false)
        })
    })

    describe('getNewMessageSignature()', () => {
        const emailAddress = 'support@acme.gorgias.io'
        const integrationsState = fromJS({
            integrations: [
                {
                    type: 'gmail',
                    meta: {
                        address: emailAddress,
                        signature: {
                            text: 'Cheers, {{current_user.first_name}}',
                            html: 'Cheers, <strong>{{current_user.first_name}}</strong>',
                        },
                    },
                },
            ],
        })

        beforeEach(() => {
            state = {
                currentUser: fromJS({first_name: 'Steve'}),
                integrations: integrationsState,
                newMessage: initialState,
                ticket: fromJS({}),
            } as RootState
        })

        it('should return a rendered signature (email address)', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'source', 'from'],
                fromJS({address: emailAddress})
            )

            expect(selectors.getNewMessageSignature(state)).toMatchSnapshot()
        })

        it('should not return a signature (chat message)', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'source', 'type'],
                'chat'
            )

            expect(selectors.getNewMessageSignature(state)).toEqualImmutable(
                fromJS({})
            )
        })

        it('should not return a signature (unknown address)', () => {
            state.newMessage = state.newMessage
                .setIn(
                    ['newMessage', 'source', 'from'],
                    fromJS({address: 'unknown@acme.gorgias.io'})
                )
                .setIn(['newMessage', 'source', 'type'], 'email')

            expect(selectors.getNewMessageSignature(state)).toEqualImmutable(
                fromJS({})
            )
        })
    })

    describe('getNewMessageAttachments()', () => {
        beforeEach(() => {
            state = {
                newMessage: initialState,
            } as RootState
        })

        it('should return the attachments of the new message', () => {
            const attachments = fromJS([{url: 'foo'}, {url: 'bar'}])
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'attachments'],
                attachments
            )

            expect(selectors.getNewMessageAttachments(state)).toEqualImmutable(
                attachments
            )
        })

        it('should return an empty immutable list because the new message has no attachments', () => {
            const attachments = null
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'attachments'],
                attachments
            )

            expect(selectors.getNewMessageAttachments(state)).toEqualImmutable(
                fromJS([])
            )
        })
    })

    describe('isNewMessageEmailExtraAdded', () => {
        it('should return the emailExtraAdded of the new message state', () => {
            state.newMessage = state.newMessage.setIn(
                ['state', 'emailExtraAdded'],
                true
            )
            expect(selectors.isNewMessageEmailExtraAdded(state)).toBe(true)
        })

        it('should return false for the initial state', () => {
            expect(selectors.isNewMessageEmailExtraAdded(state)).toBe(false)
        })
    })
})
