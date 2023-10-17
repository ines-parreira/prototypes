import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {account} from 'fixtures/account'
import {
    PerHourPerWeekTableStatContainer,
    TableCells,
} from '../PerHourPerWeekTableStat/PerHourPerWeekTableStat'

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
            businessHoursSettings: fromJS(account.settings[0]),
            currentUserTimezone: '',
            config: fromJS({}),
            meta: fromJS({}),
        } as Omit<
            ComponentProps<typeof PerHourPerWeekTableStatContainer>,
            'data'
        >

        it('Should render the table with intervals', () => {
            const {container} = render(
                <PerHourPerWeekTableStatContainer
                    data={fromJS(statPerHourPerWeekData)}
                    {...minProps}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('Should render the table with no interval in the legend', () => {
            const {container} = render(
                <PerHourPerWeekTableStatContainer
                    data={fromJS(statPerHourPerWeekZeroCountsData)}
                    {...minProps}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('Should render a message indicating we no data is present', () => {
            const {container} = render(
                <PerHourPerWeekTableStatContainer
                    data={fromJS(statPerHourPerWeekEmptyData)}
                    {...minProps}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('TableCells', () => {
        it('Should render with the same timezone for the business hours and the current user', () => {
            const {container} = render(
                <TableCells
                    lines={fromJS(statPerHourPerWeekData.lines)}
                    businessHoursSettings={fromJS(account.settings[0])}
                    userTimezone={'Europe/Berlin'}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('Should render with a different timezone between business hours and the current user', () => {
            const {container} = render(
                <TableCells
                    lines={fromJS(statPerHourPerWeekData.lines)}
                    businessHoursSettings={fromJS(account.settings[0])}
                    userTimezone={'US/Pacific'}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
