import React from 'react'
import {shallow} from 'enzyme'

import TicketCategory from '../TicketCategory'

describe('TicketCategory component', () => {
    const categories = ['delivery/status', 'order/cancel', 'order/return', 'unknown-category']

    it('should display categories', () => {
        categories.forEach((category) => {
            expect(shallow(<TicketCategory category={category}/>)).toMatchSnapshot()
        })
    })
})
