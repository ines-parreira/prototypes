import React from 'react'
import RevenueUpgrade from '../RevenueUpgrade'
import {shallow} from 'enzyme'


describe('RevenueUpgrade', () => {
    it('should render', () => {
        const component = shallow(<RevenueUpgrade />)
        expect(component).toMatchSnapshot()
    })
})
