import React from 'react'
import {shallow} from 'enzyme'

import DonutKeyMetricStat from '../KeyMetricStat/DonutKeyMetricStat'

describe('DonutKeyMetricStat', () => {
    it('should render a donut chart', () => {
        const component = shallow(
            <DonutKeyMetricStat value={5.3} maxValue={10} fill="success" />
        )
        expect(component).toMatchSnapshot()
    })
})
