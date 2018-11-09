import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import TableStat from '../TableStat/TableStat'
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
            }]
        },
        lines: [
            ['refund', 42, 12, 93, 3, -1]
        ],
    },
    name: 'tickets_per_tag',
    label: 'Tickets per tag',
    meta: {
        'previous_start_datetime': '2018-10-22',
        'previous_end_datetime': '2018-10-23',
    }
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
})
