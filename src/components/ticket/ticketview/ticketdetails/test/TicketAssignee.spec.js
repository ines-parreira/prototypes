import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {fromJS} from 'immutable'
import TicketAssignee from '../TicketAssignee'

expect.extend(expectImmutable)

describe('TicketAssignee component', () => {
    describe('with assignee', () => {
        let component

        const agents = fromJS([
            { id: 1, name: 'agent1' },
            { id: 2, name: 'agent2' },
            { id: 3, name: 'agent3' }
        ])

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <TicketAssignee
                    currentAssignee="agent1"
                    agents={agents}
                    setAgent={() => {}}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should display the assignee', () => {
            const assigneeSpan = component.props.children[0]
            expect(assigneeSpan.props.children[0].props.children).toBe('A')  // the agent's icon (A in a yellow square)
            expect(assigneeSpan.props.children[1].props.children).toBe('AGENT1')  // the agent's name
        })

        it('should have all the agents as options', () => {
            const menuItems = component.props.children[1].props.children[2]
            expect(menuItems.size).toBe(3)
        })
    })

    describe('without assignee', () => {
        let component

        const agents = fromJS([
            { id: 1, name: 'agent1' },
            { id: 2, name: 'agent2' },
            { id: 3, name: 'agent3' }
        ])

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <TicketAssignee
                    currentAssignee=""
                    agents={agents}
                    setAgent={() => {}}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should display the assignee', () => {
            const assigneeSpan = component.props.children[0]
            expect(assigneeSpan.props.children).toBe('UNASSIGNED')
        })

        it('should have all the agents as options', () => {
            const menuItems = component.props.children[1].props.children[2]
            expect(menuItems.size).toBe(3)
        })
    })
})
