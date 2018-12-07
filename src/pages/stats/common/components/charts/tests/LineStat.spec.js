import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import LineStat from '../LineStat'
import {stats as statsConfig, RESOLUTION_TIME} from '../../../../../../config/stats'

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
    },
    meta: {
        'start_datetime': '2017-09-05 00:00:00',
        'end_datetime': '2017-09-05 23:59:59'
    }
})

describe('LineStat', () => {
    it('should render a line chart', () => {
        const config = statsConfig.find((config, key) => key === RESOLUTION_TIME)
        const component = shallow(
            <LineStat
                config={config}
                {...barStat.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
