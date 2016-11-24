import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {fromJS, Map} from 'immutable'
import TicketMessages from '../TicketMessages'

expect.extend(expectImmutable)

describe('TicketMessages component', () => {
    const messages = fromJS([
        {id: 1},
        {id: 2},
        {id: 3}
    ])

    describe('with messages', () => {
        let component

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <TicketMessages
                    submit={() => {}}
                    deleteMessage={() => {}}
                    messages={messages}
                    loadingState={fromJS({updateMessage: []})}
                    ticket={fromJS({
                        customer_ratings: []
                    })}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should display all messages', () => {
            const messageList = component.props.children
            expect(messageList.size).toBe(messages.size)
        })
    })

    describe('without messages', () => {
        let component

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <TicketMessages
                    submit={() => {}}
                    deleteMessage={() => {}}
                    messages={Map()}
                    loadingState={fromJS({updateMessage: []})}
                    ticket={fromJS({
                        customer_ratings: []
                    })}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should return null if there is no messages', () => {
            expect(component).toBe(null)
        })
    })
})
