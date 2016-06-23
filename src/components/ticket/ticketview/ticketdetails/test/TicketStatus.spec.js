import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import { TICKET_STATUSES } from './../../../../../constants'
import TicketStatus from '../TicketStatus'

expect.extend(expectImmutable)

describe('TicketStatus component', () => {
    let component

    before('render element', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <TicketStatus
                setStatus={() => {}}
                currentStatus="new"
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display the status', () => {
        const label = component.props.children[0]
        expect(label.props.className).toBe('ticket-status ticket-details-item ui new label')
        expect(label.props.children).toBe('new')
    })

    it('should have all statuses as options', () => {
        const statusList = component.props.children[1].props.children.props.children
        expect(statusList.length).toBe(TICKET_STATUSES.length)
    })
})
