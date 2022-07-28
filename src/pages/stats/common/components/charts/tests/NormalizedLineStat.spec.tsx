import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import NormalizedLineStat from '../NormalizedLineStat'
import {
    stats as statsConfig,
    SELF_SERVICE_CHAT_FLOWS_DISTRIBUTION,
} from '../../../../../../config/stats'

const barStatData = {
    name: 'stat_name',
    label: 'Stat label',
    legend: {
        axes: {
            x: 'Interactions date',
            y: 'Interactions',
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

describe('NormalizedLineStat', () => {
    it('should render a line chart with total and disabled labels', () => {
        const config = statsConfig.find(
            (config, key) => key === SELF_SERVICE_CHAT_FLOWS_DISTRIBUTION
        )
        const component = shallow(
            <NormalizedLineStat
                config={config}
                data={fromJS(barStatData.data)}
                legend={fromJS(barStatData.legend)}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a line chart with "no data" message', () => {
        const config = statsConfig.find(
            (config, key) => key === SELF_SERVICE_CHAT_FLOWS_DISTRIBUTION
        )
        const component = shallow(
            <NormalizedLineStat
                config={config}
                data={fromJS(barStatNoData.data)}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
