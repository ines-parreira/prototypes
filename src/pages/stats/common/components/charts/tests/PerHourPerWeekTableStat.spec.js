// @flow
import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import PerHourPerWeekTableStat, {
    TableCells,
} from '../PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import {account} from '../../../../../../fixtures/account.ts'

const mockStore = configureMockStore([thunk])

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
        const initialState = fromJS({
            currentAccount: account,
            currentUser: {
                timezone: 'Europe/Berlin',
            },
        })

        it('Should render the table with intervals', () => {
            const component = shallow(
                <PerHourPerWeekTableStat
                    data={fromJS(statPerHourPerWeekData)}
                    store={mockStore(initialState)}
                />
            )
            expect(component.dive()).toMatchSnapshot()
        })

        it('Should render the table with no interval in the legend', () => {
            const component = shallow(
                <PerHourPerWeekTableStat
                    data={fromJS(statPerHourPerWeekZeroCountsData)}
                    store={mockStore(initialState)}
                />
            )
            expect(component.dive()).toMatchSnapshot()
        })

        it('Should render a message indicating we no data is present', () => {
            const component = shallow(
                <PerHourPerWeekTableStat
                    data={fromJS(statPerHourPerWeekEmptyData)}
                    store={mockStore(initialState)}
                />
            )
            expect(component.dive()).toMatchSnapshot()
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
