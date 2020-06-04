import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import BarStat from '../BarStat'
import {stats as statsConfig, SUPPORT_VOLUME} from '../../../../../../config/stats'

const barStatData = fromJS({
    name: 'stat_name',
    label: 'Stat label',
    legend: {
        axes: {
            x: 'created',
            y: 'closed',
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
            name: 'created',
            data: [23, 4, 445, 56]
        }, {
            name: 'closed',
            data: [65, 45, 87, 9]
        }]
    }
})
const barStatNoData = fromJS({
    data: {
        lines: []
    }
})

describe('BarStat', () => {
    it('should render a bar chart', () => {
        const config = statsConfig.find((config, key) => key === SUPPORT_VOLUME)
        const component = shallow(
            <BarStat
                config={config}
                {...barStatData.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a bar chart with "no data" message', () => {
        const config = statsConfig.find((config, key) => key === SUPPORT_VOLUME)
        const component = shallow(
            <BarStat
                config={config}
                {...barStatNoData.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
