import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import LineStat from '../LineStat'
import {
    stats as statsConfig,
    RESOLUTION_TIME,
} from '../../../../../../config/stats'

const barStat = {
    name: 'stat_name',
    label: 'Stat label',
    legend: fromJS({
        axes: {
            x: '50%',
            y: '90%',
        },
    }),
    data: fromJS({
        axes: {
            x: [123434533, 123435636, 123456568, 123876542],
            y: [],
        },
        lines: [
            {
                name: '50%',
                data: [23, 4, 445, 56],
            },
            {
                name: '90%',
                data: [65, 45, 87, 9],
            },
        ],
    }),
    meta: fromJS({
        start_datetime: '2017-09-05 00:00:00',
        end_datetime: '2017-09-05 23:59:59',
    }),
    config: statsConfig.find((config, key) => key === RESOLUTION_TIME),
}

describe('LineStat', () => {
    it('should render a line chart', () => {
        const {container} = render(<LineStat {...barStat} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
