import React from 'react'
import {shallow} from 'enzyme'

import TicketStatus from '../TicketStatus.tsx'

describe('TicketStatus component', () => {
    it('closed ticket', () => {
        const component = shallow(<TicketStatus currentStatus="closed" />)
        expect(component).toMatchSnapshot()
    })

    it('open ticket', () => {
        const component = shallow(<TicketStatus currentStatus="open" />)
        expect(component).toMatchSnapshot()
    })
})
