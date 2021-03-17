// @flow
import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import {
    PerHourPerWeekTableStatContainer,
    TableCells,
} from '../PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import {account} from '../../../../../../fixtures/account.ts'

const statPerHourPerWeekData = {
    axes: {
        x: [
            {name: 'Hour', type: 'string'},
            {name: 'Monday', type: 'number', value: 1},
            {name: 'Tuesday', type: 'number', value: 2},
            {name: 'Wednesday', type: 'number', value: 3},
            {name: 'Thursday', type: 'number', value: 4},
            {name: 'Friday', type: 'number', value: 5},
            {name: 'Saturday', type: 'number', value: 6},
            {name: 'Sunday', type: 'number', value: 7},
        ],
    },
    lines: [
        [
            {type: 'string', value: '00:00'},
            {type: 'number', value: 0},
            {type: 'number', value: 1},
            {type: 'number', value: 2},
            {type: 'number', value: 3},
            {type: 'number', value: 3},
            {type: 'number', value: 2},
            {type: 'number', value: 0},
        ],
        [
            {type: 'string', value: '01:00'},
            {type: 'number', value: 0},
            {type: 'number', value: 4},
            {type: 'number', value: 4},
            {type: 'number', value: 7},
            {type: 'number', value: 3},
            {type: 'number', value: 3},
            {type: 'number', value: 2},
        ],
    ],
}

const statPerHourPerWeekZeroCountsData = {
    axes: {
        x: [
            {name: 'Hour', type: 'string'},
            {name: 'Monday', type: 'number', value: 1},
            {name: 'Tuesday', type: 'number', value: 2},
            {name: 'Wednesday', type: 'number', value: 3},
            {name: 'Thursday', type: 'number', value: 4},
            {name: 'Friday', type: 'number', value: 5},
            {name: 'Saturday', type: 'number', value: 6},
            {name: 'Sunday', type: 'number', value: 7},
        ],
    },
    lines: [
        [
            {type: 'string', value: '00:00'},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
        ],
        [
            {type: 'string', value: '01:00'},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
            {type: 'number', value: 0},
        ],
    ],
}

const statPerHourPerWeekEmptyData = {axes: {}, lines: []}

describe('PerHourPerWeekTableStat', () => {
    describe('Table', () => {
        const minProps = {
            businessHoursSettings: fromJS({}),
            currentUserTimezone: '',
            config: fromJS({}),
            meta: fromJS({}),
        }

        it('Should render the table with intervals', () => {
            const component = shallow(
                <PerHourPerWeekTableStatContainer
                    data={fromJS(statPerHourPerWeekData)}
                    {...minProps}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('Should render the table with no interval in the legend', () => {
            const component = shallow(
                <PerHourPerWeekTableStatContainer
                    data={fromJS(statPerHourPerWeekZeroCountsData)}
                    {...minProps}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('Should render a message indicating we no data is present', () => {
            const component = shallow(
                <PerHourPerWeekTableStatContainer
                    data={fromJS(statPerHourPerWeekEmptyData)}
                    {...minProps}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })

    describe('TableCells', () => {
        it('Should render with the same timezone for the business hours and the current user', () => {
            const component = shallow(
                <TableCells
                    lines={fromJS(statPerHourPerWeekData.lines)}
                    businessHoursSettings={fromJS(account.settings[0])}
                    userTimezone={'Europe/Berlin'}
                />
            )
            expect(component.render()).toMatchSnapshot()
        })

        it('Should render with a different timezone between business hours and the current user', () => {
            const component = shallow(
                <TableCells
                    lines={fromJS(statPerHourPerWeekData.lines)}
                    businessHoursSettings={fromJS(account.settings[0])}
                    userTimezone={'US/Pacific'}
                />
            )
            expect(component.render()).toMatchSnapshot()
        })
    })
})
