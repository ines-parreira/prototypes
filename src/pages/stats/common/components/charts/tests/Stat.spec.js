import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {StatContainer} from '../Stat'

const minProps = {
    name: 'stat_name',
    label: 'Stat label',
    legend: fromJS({}),
    data: fromJS({}),
    meta: fromJS({}),
    tagColors: null,
    notify: jest.fn(),
}

describe('Stat', () => {
    it('should render a bar chart', () => {
        const config = fromJS({style: 'bar'})
        const component = shallow(
            <StatContainer {...minProps} config={config} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a line chart', () => {
        const config = fromJS({style: 'line'})
        const component = shallow(
            <StatContainer {...minProps} config={config} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a table chart', () => {
        const config = fromJS({style: 'table'})
        const component = shallow(
            <StatContainer {...minProps} config={config} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a key metrics chart', () => {
        const config = fromJS({style: 'key-metrics'})
        const component = shallow(
            <StatContainer {...minProps} config={config} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a per hour per week table', () => {
        const config = fromJS({style: 'per-hour-per-week-table'})
        const component = shallow(
            <StatContainer {...minProps} config={config} />
        )
        expect(component).toMatchSnapshot()
    })
})
