import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import PushJS from 'push.js'

import client from '../../../models/api/resources'
import browserNotification from '../../../services/browserNotification'
import * as actions from '../actions'
import {initialState} from '../reducers'
import {StoreDispatch} from '../../types'
import {Ticket} from '../../../models/ticket/types'
import {RecentChatTicket} from '../../../business/types/recentChats'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})

jest.mock('../../../services/browserNotification', () => {
    return {
        newMessage: jest.fn(),
    }
})

describe('actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            currentAccount: initialState,
        })
        mockServer = new MockAdapter(client)
        jest.clearAllMocks()
    })

    describe('chats', () => {
        describe('fetchChats()', () => {
            it('should fetch chats', () => {
                const chats = {
                    tickets: [
                        {
                            id: 123,
                        },
                        {
                            id: 2,
                        },
                    ],
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
                    } as unknown as Ticket,
                ]
                store.dispatch(actions.setChats(chats))
                expect(store.getActions()).toMatchSnapshot()
                expect(
                    (PushJS as unknown as {getAll: () => any[]}).getAll()
                ).toMatchSnapshot()
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
            } as unknown as RecentChatTicket

            it('should add chat with notifications', () => {
                store.dispatch(actions.addChat(chat, true))
                expect(store.getActions()).toMatchSnapshot()
                expect(browserNotification.newMessage).toHaveBeenNthCalledWith(
                    1,
                    {
                        body: 'Hi',
                        playSoundNotification: true,
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
