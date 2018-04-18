import React from 'react'
import StatsNavbarView from '../StatsNavbarView'
import {shallow} from 'enzyme'

describe('StatsNavbarView', () => {
    it('should render', () => {
        const component = shallow(<StatsNavbarView/>)
        expect(component).toMatchSnapshot()
    })
})
