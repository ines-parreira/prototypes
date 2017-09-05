import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import LineStat from '../LineStat'
import {config as statsConfig} from '../../../../../../config/stats'

const barStat = fromJS({
    name: 'stat_name',
    label: 'Stat label',
    legend: {
        axes: {
            x: '50%',
            y: '90%',
        }
    },
    data: {
        axes: {
            x: [
                123434533,
                123435636,
                123456568,
                123876542,
            ],
            y: [],
        },
        lines: [{
            name: '50%',
            data: [23, 4, 445, 56]
        }, {
            name: '90%',
            data: [65, 45, 87, 9]
        }]
    }
})

describe('LineStat', () => {
    it('should render a line chart', () => {
        const config = statsConfig.find((config, key) => key === 'resolution_time_per_day')
        const component = shallow(
            <LineStat config={config} {...barStat.toObject()}/>
        )
        expect(component).toMatchSnapshot()
    })
})
