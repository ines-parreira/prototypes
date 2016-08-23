import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {TICKET_STATUSES} from './../../../../../../config'
import TicketStatus from '../TicketStatus'

expect.extend(expectImmutable)

describe('TicketStatus component', () => {
    let component

    before('render element', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <TicketStatus
                setStatus={() => {
                }}
                currentStatus="new"
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display the quick status action', () => {
        const label = component.props.children[0]
        expect(label.props.className).toContain('ticket-status-action')
        expect(label.props.children).toBe('CLOSE')
    })

    it('should have all statuses as options', () => {
        const statusList = component.props.children[1].props.children.props.children
        expect(statusList.length).toBe(TICKET_STATUSES.length)
    })
})
