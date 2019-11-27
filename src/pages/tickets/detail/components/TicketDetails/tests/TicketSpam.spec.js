import React from 'react'
import {mount, shallow} from 'enzyme'

import TicketSpam from '../TicketSpam'

describe('TicketSpam', () => {
    describe('props', () => {
        it('should use default props', () => {
            const component = mount(
                <TicketSpam />
            )

            expect(component.props()).toMatchSnapshot()
        })
    })

    describe('html', () => {
        it('should display spam flag', () => {
            const component = shallow(
                <TicketSpam spam={true}/>
            )

            expect(component.html()).toMatchSnapshot()
        })
        it('should not display a spam flag', () => {
            const component = shallow(
                <TicketSpam/>
            )

            expect(component.html()).toMatchSnapshot()
        })
    })
})
