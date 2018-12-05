import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Stat from '../Stat'

const mockStore = configureMockStore([thunk])
const stat = fromJS({
    name: 'stat_name',
    label: 'Stat label',
    legend: {},
    data: {},
    meta: {}
})

describe('Stat', () => {
    it('should render a bar chart', () => {
        const config = fromJS({style: 'bar'})
        const component = shallow(
            <Stat
                store={mockStore({})}
                config={config}
                {...stat.toObject()}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('should render a line chart', () => {
        const config = fromJS({style: 'line'})
        const component = shallow(
            <Stat
                store={mockStore({})}
                config={config}
                {...stat.toObject()}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('should render a table chart', () => {
        const config = fromJS({style: 'table'})
        const component = shallow(
            <Stat
                store={mockStore({})}
                config={config}
                {...stat.toObject()}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('should render a key metrics chart', () => {
        const config = fromJS({style: 'key-metrics'})
        const component = shallow(
            <Stat
                store={mockStore({})}
                config={config}
                {...stat.toObject()}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })
})
