import React from 'react'
import {shallow} from 'enzyme'

import StatsNavbarView from '../StatsNavbarView.tsx'

describe('StatsNavbarView', () => {
    it('should render', () => {
        const component = shallow(<StatsNavbarView />)
        expect(component).toMatchSnapshot()
    })
})
