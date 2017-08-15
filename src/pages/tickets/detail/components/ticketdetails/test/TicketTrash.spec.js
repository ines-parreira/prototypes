import React from 'react'
import {mount, shallow} from 'enzyme'
import TicketTrash from '../TicketTrash'

describe('TicketTrash', () => {
    describe('props', () => {
        it('should use default props', () => {
            const component = mount(
                <TicketTrash />
            )

            expect(component.props()).toMatchSnapshot()
        })
    })

    describe('html', () => {
        it('should display trash icon', () => {
            const component = shallow(
                <TicketTrash trashed={true}/>
            )

            expect(component.html()).toMatchSnapshot()
        })
        it('should not display a trash icon', () => {
            const component = shallow(
                <TicketTrash/>
            )

            expect(component.html()).toMatchSnapshot()
        })
    })
})
