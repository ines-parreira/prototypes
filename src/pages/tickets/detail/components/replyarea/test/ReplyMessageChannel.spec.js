import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureStore from '../../../../../../store/configureStore'
import ReplyMessageChannel from '../ReplyMessageChannel'

describe('ReplyMessageChannel component', () => {
    it('new ticket', () => {
        const component = shallow(
            <ReplyMessageChannel
                store={configureStore()}
                ticket={fromJS({})}
            />
        ).find('ReplyMessageChannel').dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })

    it('existing ticket without messages', () => {
        const component = shallow(
            <ReplyMessageChannel
                store={configureStore({
                    ticket: fromJS({
                        id: 12,
                    })
                })}
            />
        ).find('ReplyMessageChannel').dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })

    const types = ['email', 'chat', 'facebook-message', 'facebook-messenger', 'facebook-post', 'facebook-comment']

    types.forEach((type) => {
        it(`existing ticket with message of type ${type}`, () => {
            let newMessageType = type

            if (type === 'facebook-post') {
                newMessageType = 'facebook-comment'
            }

            const component = shallow(
                <ReplyMessageChannel
                    store={configureStore({
                        ticket: fromJS({
                            id: 12,
                            messages: [{
                                id: 1,
                                source: {
                                    type: type,
                                },
                            }],
                        }),
                        newMessage: fromJS({
                            newMessage: {
                                source: {
                                    type: newMessageType,
                                },
                            }
                        })
                    })}
                />
            ).find('ReplyMessageChannel').dive() // dive in connect()ed component
            expect(component).toMatchSnapshot()
        })
    })

    it('existing ticket with last message as chat message', () => {
        const component = shallow(
            <ReplyMessageChannel
                store={configureStore({
                    ticket: fromJS({
                        id: 12,
                        messages: [{
                            id: 2,
                            source: {
                                type: 'chat',
                            },
                            created_datetime: '2017-07-27T22:03:30.656613+00:00',
                        }, {
                            id: 1,
                            source: {
                                type: 'email',
                            },
                            created_datetime: '2017-07-26T22:03:30.656613+00:00',
                        }],
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                type: 'chat',
                            },
                        }
                    })
                })}
            />
        ).find('ReplyMessageChannel').dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })
})
