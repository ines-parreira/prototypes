import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import DonutKeyMetricStat from '../KeyMetricStat/DonutKeyMetricStat'

describe('DonutKeyMetricStat', () => {
    const minProps: ComponentProps<typeof DonutKeyMetricStat> = {
        value: 5.3,
        maxValue: 10,
        fill: 'success',
        formattedValue: '',
        label: '',
        differenceComponent: undefined,
    }
    it('should render a donut chart', () => {
        const component = shallow(<DonutKeyMetricStat {...minProps} />)
        expect(component).toMatchSnapshot()
    })
})
