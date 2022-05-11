import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {stats as statsConfig, SUPPORT_VOLUME} from 'config/stats'

import BarStat from '../BarStat'

const minProps: ComponentProps<typeof BarStat> = {
    data: fromJS({
        axes: {
            x: [123434533, 123435636, 123456568, 123876542],
            y: [],
        },
        lines: [
            {
                name: 'created',
                data: [23, 4, 445, 56],
            },
            {
                name: 'closed',
                data: [65, 45, 87, 9],
            },
        ],
    }),
    config: fromJS({}),
    legend: fromJS({
        axes: {
            x: 'created',
            y: 'closed',
        },
    }),
}

const minPropsNoData: ComponentProps<typeof BarStat> = {
    ...minProps,
    data: fromJS({
        lines: [],
    }),
}

describe('BarStat', () => {
    it('should render a bar chart', () => {
        const config = statsConfig.find((config, key) => key === SUPPORT_VOLUME)
        const component = shallow(<BarStat {...minProps} config={config} />)
        expect(component).toMatchSnapshot()
    })

    it('should render a bar chart with "no data" message', () => {
        const config = statsConfig.find((config, key) => key === SUPPORT_VOLUME)
        const component = shallow(
            <BarStat {...minPropsNoData} config={config} />
        )
        expect(component).toMatchSnapshot()
    })
})
