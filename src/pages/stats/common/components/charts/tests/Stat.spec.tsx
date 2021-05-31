import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {
    TICKETS_CREATED_PER_CHANNEL_PER_DAY,
    RESOLUTION_TIME,
    LATEST_SATISFACTION_SURVEYS,
    REVENUE_OVERVIEW,
    TICKET_CREATED_PER_HOUR_PER_WEEKDAY,
} from '../../../../../../config/stats'
import {Stat} from '../../../../../../models/stat/types'
import {StatContainer} from '../Stat'

jest.mock('../BarStat.js', () => () => <div>BarStat</div>)

jest.mock('../LineStat', () => () => <div>LineStat</div>)

jest.mock('../TableStat/TableStat.js', () => () => <div>TableStat</div>)

jest.mock('../KeyMetricStat/KeyMetricStat.js', () => () => (
    <div>KeyMetricStat</div>
))

jest.mock('../PerHourPerWeekTableStat/PerHourPerWeekTableStat.js', () => () => (
    <div>PerHourPerWeekTableStat</div>
))

const minProps = {
    name: 'stat_name',
    tagColors: null,
    notify: jest.fn(),
    filters: fromJS({}),
    loading: false,
    stat: {data: {label: 'Stat label'}} as Stat,
}

describe('Stat', () => {
    it('should render a bar chart', () => {
        const {container} = render(
            <StatContainer
                {...minProps}
                name={TICKETS_CREATED_PER_CHANNEL_PER_DAY}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a line chart', () => {
        const {container} = render(
            <StatContainer {...minProps} name={RESOLUTION_TIME} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a table chart', () => {
        const {container} = render(
            <StatContainer {...minProps} name={LATEST_SATISFACTION_SURVEYS} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a key metrics chart', () => {
        const {container} = render(
            <StatContainer {...minProps} name={REVENUE_OVERVIEW} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a per hour per week table', () => {
        const {container} = render(
            <StatContainer
                {...minProps}
                name={TICKET_CREATED_PER_HOUR_PER_WEEKDAY}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
