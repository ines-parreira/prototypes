import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import TableStat from '../TableStat'
import {config as statsConfig} from '../../../../../../config/stats'

const barStat = fromJS({
    data: {
        axes: {
            x: [{
                name: 'Tags',
                type: 'string'
            }, {
                name: 'New tickets #',
                type: 'number'
            }]
        },
        lines: [
            ['refund', 42]
        ]
    },
    name: 'tickets_per_tag',
    label: 'Tickets per tag'
})

describe('TableStat', () => {
    it('should render a table chart', () => {
        const config = statsConfig.find((config, key) => key === 'tickets_per_tag')
        const component = shallow(
            <TableStat config={config} {...barStat.toObject()}/>
        )
        expect(component).toMatchSnapshot()
    })
})
