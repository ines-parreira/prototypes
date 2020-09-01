import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import PushJS from 'push.js'

import browserNotification from '../../../services/browserNotification.ts'
import * as actions from '../actions.ts'
import {initialState} from '../reducers.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

jest.mock('../../../services/browserNotification', () => {
    return {
        newMessage: jest.fn(),
    }
})

describe('actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({currentAccount: initialState})
        mockServer = new MockAdapter(axios)
        jest.clearAllMocks()
    })

    describe('chats', () => {
        describe('fetchChats()', () => {
            it('should fetch chats', () => {
                const chats = {
                    tickets: [{id: 123}, {id: 2}],
                }

                mockServer.onGet('/api/activity/chats/').reply(200, chats)

                return store
                    .dispatch(actions.fetchChats())
                    .then(() => expect(store.getActions()).toMatchSnapshot())
            })
        })

        describe('setChats()', () => {
            it('should add chats with notifications', () => {
                const chats = [
                    {
                        id: 1,
                        customer: {
                            name: 'Mark Frizeli',
                        },
                        last_message_body_text: 'Hi',
                    },
                ]
                store.dispatch(actions.setChats(chats))
                expect(store.getActions()).toMatchSnapshot()
                expect(PushJS.getAll()).toMatchSnapshot()
            })
        })

        describe('addChat()', () => {
            beforeEach(() => {
                PushJS.clear()
            })

            const chat = {
                id: 1,
                customer: {
                    name: 'Mark Frizeli',
                },
                last_message_body_text: 'Hi',
            }

            it('should add chat with notifications', () => {
                store.dispatch(actions.addChat(chat, true))
                expect(store.getActions()).toMatchSnapshot()
                expect(browserNotification.newMessage).toHaveBeenNthCalledWith(
                    1,
                    {
                        body: 'Hi',
                        ticketId: 1,
                        title: 'Mark Frizeli',
                    }
                )
            })

            it('should add chat without notifications', () => {
                store.dispatch(actions.addChat(chat, false))
                expect(store.getActions()).toMatchSnapshot()
                expect(browserNotification.newMessage).not.toHaveBeenCalled()
            })
        })

        describe('removeChat()', () => {
            it('should remove chat', () => {
                expect(actions.removeChat(12)).toMatchSnapshot()
            })
        })

        describe('markChatAsRead()', () => {
            it('should mark chat as read', () => {
                expect(actions.markChatAsRead(12)).toMatchSnapshot()
            })
        })
    })
})
