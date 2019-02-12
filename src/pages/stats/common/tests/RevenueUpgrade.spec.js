import React from 'react'
import {shallow} from 'enzyme'

import RevenueUpgrade from '../RevenueUpgrade'


describe('RevenueUpgrade', () => {
    it('should render', () => {
        const component = shallow(<RevenueUpgrade />)
        expect(component).toMatchSnapshot()
    })
})
