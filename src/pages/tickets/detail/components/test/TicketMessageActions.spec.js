import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import TicketMessageActions from '../TicketMessageActions'

expect.extend(expectImmutable)

describe('TicketMessageActions component', () => {
    let component

    const args = {
        headers: {
            Authorization: 'auth',
            ContentType: 'application/json'
        },
        params: {
            userId: 1,
            accoundId: 4,
            otherId: 8,
            anyId: 12
        }
    }

    const message = {
        actions: [
            {name: 'setResponseText'},
            {name: 'http', status: 'pending', title: 'action1', arguments: args},
            {name: 'http', status: 'error', title: 'action2', arguments: args},
            {name: 'http', status: 'canceled', title: 'action3', arguments: args},
            {name: 'http', status: 'success', title: 'action4', arguments: args}
        ]
    }

    before('render element', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <TicketMessageActions
                message={message}
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display only actions with execution in back-end', () => {
        const actionList = component.props.children
        expect(actionList.length).toBe(4)
    })

    it('should display actions titles', () => {
        const action1Title = component.props.children[0].props.children[0].props.children[1]
        expect(action1Title).toBe('action1')

        const action3Title = component.props.children[2].props.children[0].props.children[1]
        expect(action3Title).toBe('action3')
    })
})
