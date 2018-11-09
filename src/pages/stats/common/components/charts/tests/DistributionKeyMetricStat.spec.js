import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import DistributionKeyMetricStat from '../KeyMetricStat/DistributionKeyMetricStat'


describe('DistributionKeyMetricStat', () => {
    it('should render a distribution chart', () => {
        const component = shallow(
            <DistributionKeyMetricStat
                config={fromJS({
                    maxValue: 5,
                    minValue: 1,
                    variant: 'star',
                })}
                formattedValue={fromJS({
                    '1': '1',
                    '2': '2',
                    '3': '3',
                    '4': '4',
                    '5': '5',
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
