import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

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
    label: 'Stat label',
    legend: fromJS({}),
    data: fromJS({}),
    meta: fromJS({}),
    tagColors: null,
    notify: jest.fn(),
    filters: fromJS({}),
    loading: false,
}

describe('Stat', () => {
    it('should render a bar chart', () => {
        const config = fromJS({style: 'bar'})
        const {container} = render(
            <StatContainer {...minProps} config={config} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a line chart', () => {
        const config = fromJS({style: 'line'})
        const {container} = render(
            <StatContainer {...minProps} config={config} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a table chart', () => {
        const config = fromJS({style: 'table'})
        const {container} = render(
            <StatContainer {...minProps} config={config} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a key metrics chart', () => {
        const config = fromJS({style: 'key-metrics'})
        const {container} = render(
            <StatContainer {...minProps} config={config} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a per hour per week table', () => {
        const config = fromJS({style: 'per-hour-per-week-table'})
        const {container} = render(
            <StatContainer {...minProps} config={config} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
