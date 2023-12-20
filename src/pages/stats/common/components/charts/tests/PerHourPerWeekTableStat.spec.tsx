import {render} from '@testing-library/react'

import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {account} from 'fixtures/account'
import {
    statPerHourPerWeekData,
    statPerHourPerWeekEmptyData,
    statPerHourPerWeekZeroCountsData,
} from 'fixtures/stats'
import {
    PerHourPerWeekTableStatContainer,
    TableCells,
} from '../PerHourPerWeekTableStat/PerHourPerWeekTableStat'

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
