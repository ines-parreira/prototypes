import React from 'react'
import {shallow} from 'enzyme'

import DistributionVariantStat from '../DistributionVariantStat.tsx'

describe('DistributionVariantStat', () => {
    it('should render a distribution chart', () => {
        const component = shallow(
            <DistributionVariantStat
                minValue={1}
                maxValue={5}
                variant="star"
                currentValue={2}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
