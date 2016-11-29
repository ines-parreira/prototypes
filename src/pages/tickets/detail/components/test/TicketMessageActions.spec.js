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

    it('should display icons and label colors depending on actions\' statuses', () => {
        // Pending
        const action1Label = component.props.children[0].props.children[0]
        expect(action1Label.props.className).toContain('yellow')

        const action1Icon = action1Label.props.children[0]
        expect(action1Icon.props.className).toBe('icon circle')

        // Error
        const action2Label = component.props.children[1].props.children[0]
        expect(action2Label.props.className).toContain('orange')

        const action2Icon = action2Label.props.children[0]
        expect(action2Icon.props.className).toBe('icon circle remove')

        // Canceled
        const action3Label = component.props.children[2].props.children[0]
        expect(action3Label.props.className).toContain('red')

        const action3Icon = action3Label.props.children[0]
        expect(action3Icon.props.className).toBe('icon ban')

        // Success
        const action4Label = component.props.children[3].props.children[0]
        expect(action4Label.props.className).toContain('olive')

        const action4Icon = action4Label.props.children[0]
        expect(action4Icon.props.className).toBe('icon circle check')
    })
})
