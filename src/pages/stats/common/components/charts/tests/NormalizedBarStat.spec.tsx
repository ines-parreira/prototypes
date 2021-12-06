import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import NormalizedBarStat from '../NormalizedBarStat'
import {
    stats as statsConfig,
    SELF_SERVICE_FLOWS_DISTRIBUTION,
} from '../../../../../../config/stats'

const barStatData = {
    name: 'stat_name',
    label: 'Stat label',
    legend: {
        axes: {
            x: 'Interaction date',
            y: 'Flow usage',
        },
    },
    data: {
        axes: {
            x: [123434533, 123435636, 123456568, 123876542],
            y: [],
        },
        lines: [
            {
                name: 'track',
                data: [23, 4, 445, 56],
            },
            {
                name: 'report_issues',
                data: [65, 45, 87, 9],
            },
            {
                name: 'cancellations',
                data: [65, 45, 87, 9],
            },
            {
                name: 'other_tickets',
                data: [65, 45, 87, 9],
            },
        ],
    },
}

const barStatNoData = {
    data: {
        lines: [],
    },
}

describe('NormalizedBarStat', () => {
    it('should render a bar with total chart and disabled labels', () => {
        const config = statsConfig.find(
            (config, key) => key === SELF_SERVICE_FLOWS_DISTRIBUTION
        )
        const component = shallow(
            <NormalizedBarStat
                config={config}
                data={fromJS(barStatData.data)}
                legend={fromJS(barStatData.legend)}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a bar chart with "no data" message', () => {
        const config = statsConfig.find(
            (config, key) => key === SELF_SERVICE_FLOWS_DISTRIBUTION
        )
        const component = shallow(
            <NormalizedBarStat
                config={config}
                data={fromJS(barStatNoData.data)}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
