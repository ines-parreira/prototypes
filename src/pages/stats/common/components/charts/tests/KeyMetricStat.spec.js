import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {config as statsConfig} from '../../../../../../config/stats'
import KeyMetricStat from '../KeyMetricStat'

const barStat = fromJS({
    name: 'overview',
    data: {
        difference_period: [{
            data: -65,
            name: 'total_new_tickets'
        }
        ],
        previous_period: [{
            data: 290,
            name: 'total_new_tickets'
        }
        ],
        current_period: [
            {
                data: 103,
                name: 'total_new_tickets'
            }
        ]
    },
    meta: {
        previous_start_datetime: '2017-09-05 00:00:00',
        previous_end_datetime: '2017-09-06 23:59:59',
    }
})

describe('KeyMetricStat', () => {
    it('should render a key metrics chart', () => {
        const config = statsConfig.find((config, key) => key === 'overview')
        const component = shallow(
            <KeyMetricStat config={config} {...barStat.toObject()}/>
        )
        expect(component).toMatchSnapshot()
    })
})
