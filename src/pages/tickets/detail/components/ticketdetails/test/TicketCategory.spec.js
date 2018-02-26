import React from 'react'
import {shallow} from 'enzyme'

import TicketCategory from '../TicketCategory'

describe('TicketCategory component', () => {
    const categories = ['delivery/status', 'order/cancel', 'order/return', 'unknown-category']

    it('should display categories', () => {
        window.DEVELOPMENT = true
        categories.forEach((category) => {
            expect(shallow(<TicketCategory category={category}/>)).toMatchSnapshot()
        })
        window.DEVELOPMENT = false
    })
    it('should display empty dropdown', () => {
        window.DEVELOPMENT = true
        expect(shallow(<TicketCategory/>)).toMatchSnapshot()
        window.DEVELOPMENT = false
    })

    it('should be null if not development', () => {
        expect(shallow(<TicketCategory/>)).toMatchSnapshot()
    })
})
