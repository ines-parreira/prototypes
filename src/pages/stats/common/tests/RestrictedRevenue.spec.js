import React from 'react'
import {shallow} from 'enzyme'

import RestrictedRevenue from '../RestrictedRevenue'


describe('RevenueUpgrade', () => {
    it('should render feature missing', () => {
        const component = shallow(
            <RestrictedRevenue
                hasFeature={false}
                hasRequiredIntegration={true}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render missing required integration', () => {
        const component = shallow(
            <RestrictedRevenue
                hasRequiredIntegration={false}
                hasFeature={true}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
