import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, List} from 'immutable'

import {RootState} from 'state/types'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

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

    describe('hasContent()', () => {
        it('should return false when no body_text nor attachments are set and the message is not forward', () => {
            expect(selectors.hasContent(state)).toEqual(false)
        })

        it('should return false when body_text has only whitespace chars', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'body_text'],
                '  \n\t'
            )
            expect(selectors.hasContent(state)).toEqual(false)
        })

        it('should return true when body_text has non-whitespace chars', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'body_text'],
                'Hello World'
            )
            expect(selectors.hasContent(state)).toEqual(true)
        })

        it('should return true when message is forwarded', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'source', 'extra', 'forward'],
                true
            )
            expect(selectors.hasContent(state)).toEqual(true)
        })

        it('should return true when attachments are set', () => {
            state.newMessage = state.newMessage.setIn(
                ['newMessage', 'attachments'],
                List([{}])
            )

            expect(selectors.hasContent(state)).toEqual(true)
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

    describe('getNewMessageRecipients()', () => {
        it('should return all recipients', () => {
            state = {
                newMessage: initialState.mergeDeep({
                    newMessage: {
                        source: {
                            to: [
                                {address: 'to1@to.com'},
                                {address: 'to2@to.com'},
                            ],
                            cc: [
                                {address: 'cc1@cc.com'},
                                {address: 'cc2@cc.com'},
                            ],
                            bcc: [
                                {address: 'bcc1@bcc.com'},
                                {address: 'bcc2@bcc.com'},
                            ],
                        },
                    },
                }),
            } as RootState

            expect(selectors.getNewMessageRecipients(state)).toMatchSnapshot()
        })
    })

    describe('isNewMessageEmailExtraAdded()', () => {
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

    describe('canSend()', () => {
        describe.each([
            ['active account', true],
            ['inactive account', false],
        ])('%s', (testName, isActive) => {
            describe.each([
                ['message with recipients', true, true],
                ['private message', false, false],
                ['public message without recipients', false, true],
            ])('%s', (testName, hasRecipients, isPublic) => {
                const expectedResult = isActive && (hasRecipients || !isPublic)
                const resultFunc = (
                    selectors.canSend as unknown as {
                        resultFunc: (
                            isAccountActive: boolean,
                            hasRecipients: boolean,
                            isPublic: boolean,
                            hasContent: boolean,
                            getHasContentlessAction: boolean
                        ) => boolean
                    }
                ).resultFunc

                it('should return false when has no content and no contentless actions', () => {
                    expect(
                        resultFunc(
                            isActive,
                            hasRecipients,
                            isPublic,
                            false,
                            false
                        )
                    ).toBe(false)
                })

                it(`should return ${expectedResult.toString()} when has content`, () => {
                    expect(
                        resultFunc(
                            isActive,

                            hasRecipients,
                            isPublic,
                            true,
                            false
                        )
                    ).toBe(expectedResult)
                })

                it(`should return ${expectedResult.toString()} when has contentless action`, () => {
                    expect(
                        resultFunc(
                            isActive,

                            hasRecipients,
                            isPublic,
                            false,
                            true
                        )
                    ).toBe(expectedResult)
                })
            })
        })
    })
})
