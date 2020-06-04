// @flow
import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import { TableStat } from '../TableStat/TableStat'
import {stats as statsConfig, TICKETS_PER_TAG} from '../../../../../../config/stats'

const tableStatData = fromJS({
    data: {
        axes: {
            x: [{
                name: 'Tags',
                type: 'string'
            }, {
                name: 'New tickets #',
                type: 'number'
            }, {
                name: 'Percent',
                type: 'percent'
            }, {
                name: 'Agent Score',
                type: 'satisfaction-score'
            }, {
                name: 'Survey Score',
                type: 'satisfaction-score'
            }, {
                name: 'Delta',
                type: 'delta'
            }, {
                name: 'Sales',
                type: 'currency',
                currency: 'AUD'
            }]
        },
        lines: [
            [{
                type: 'string',
                value: 'refund',
            }, {
                type: 'number',
                value: 42,
            }, {
                type: 'percent',
                value: 12,
            }, {
                type: 'satisfaction-score',
                value: 93,
            }, {
                type: 'satisfaction-score',
                value: 3,
            }, {
                type: 'delta',
                value: -1,
            }, {
                type: 'currency',
                value: 3.50,
            }]
        ]
    },
    name: 'tickets_per_tag',
    label: 'Tickets per tag',
    meta: {
        'previous_start_datetime': '2018-10-22',
        'previous_end_datetime': '2018-10-23',
    }
})
const tableStatNoData = fromJS({
    data: {
        lines: [],
    },
    meta: {},
})

describe('TableStat', () => {
    it('should render a table chart', () => {
        const config = statsConfig.find((config, key) => key === TICKETS_PER_TAG)
        const component = shallow(
            <TableStat
                context={{tagColors: null}}
                config={config}
                {...tableStatData.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a table chart with "no data" message', () => {
        const config = statsConfig.find((config, key) => key === TICKETS_PER_TAG)
        const component = shallow(
            <TableStat
                context={{ tagColors: null }}
                config={config}
                {...tableStatNoData.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
