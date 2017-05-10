import React from 'react'
import {shallow} from 'enzyme'
import TicketPriority from '../TicketPriority'

describe('TicketPriority component', () => {
    let component

    beforeAll(() => {
        component = shallow(
            <TicketPriority
                priority="high"
                togglePriority={() => {}}
            />
        )
    })

    it('should display the priority', () => {
        expect(component.children().at(0)).toHaveClassName('ticket-priority action icon flag')
    })

    it('should call \'togglePriority\' when clicked on', () => {
        const spy = jest.fn()
        const component = shallow(
            <TicketPriority
                priority="normal"
                togglePriority={spy}
            />
        )

        component.simulate('click')
        expect(spy).toHaveBeenCalled()
    })
})
