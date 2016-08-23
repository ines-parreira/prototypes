import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'
import TicketPriority from '../TicketPriority'

expect.extend(expectImmutable)

describe('TicketPriority component', () => {
    let component

    before('render element', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <TicketPriority
                priority="high"
                togglePriority={() => {}}
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display the priority', () => {
        const icon = component.props.children
        expect(icon.props.className).toBe('ticket-priority action icon flag')
    })

    it('should call \'togglePriority\' when clicked on', () => {
        const spy = expect.createSpy()
        const mountedComponent = TestUtils.renderIntoDocument(
            <TicketPriority
                priority="normal"
                togglePriority={spy}
            />
        )

        TestUtils.Simulate.click(ReactDOM.findDOMNode(mountedComponent))
        expect(spy).toHaveBeenCalled()
    })
})
