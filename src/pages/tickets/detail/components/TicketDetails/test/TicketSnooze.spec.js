import React from 'react'
import moment from 'moment'
import {shallow} from 'enzyme'

import TicketSnooze from '../TicketSnooze'

describe('TicketSnooze', () => {
    it('should render an icon with a tooltip', () => {
        const wrapper = shallow(
            <TicketSnooze
                datetime={moment('2017-12-22')}
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
