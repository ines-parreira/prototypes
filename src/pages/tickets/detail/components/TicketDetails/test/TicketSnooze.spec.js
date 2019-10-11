import React from 'react'
import {shallow} from 'enzyme'

import {TicketSnooze} from '../TicketSnooze'


describe('<TicketSnooze/>', () => {
    describe('render()', () => {
        it('should render an icon with a tooltip', () => {
            const wrapper = shallow(
                <TicketSnooze
                    datetime="2017-12-22 17:00"
                    timezone="utc"
                />
            )
            expect(wrapper).toMatchSnapshot()
        })

        it('should render null', () => {
            const wrapper = shallow(
                <TicketSnooze/>
            )
            expect(wrapper).toMatchSnapshot()
        })
    })
})
