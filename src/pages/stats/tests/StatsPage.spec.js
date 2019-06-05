import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {StatsPage} from '../StatsPage'

describe('StatsPage', () => {
    const defaultProps = {
        globalFilters: null,
        setStatsFilters: jest.fn()
    }

    it('should render a component used to restrict access to satisfaction survey statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                params={{view: 'satisfaction'}}
                config={fromJS({
                    name: 'Satisfaction',
                    link: 'satisfaction',
                    stats: [],
                })}
                globalFilters={fromJS({})}
                currentAccount={fromJS({
                    extra_features: [],
                    settings: [{
                        data: {},
                        type: 'satisfaction-surveys'
                    }]
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a component used to restrict access to revenue statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                params={{view: 'revenue'}}
                config={fromJS({
                    name: 'Revenue (Beta)',
                    link: 'revenue',
                    stats: [],
                })}
                currentAccount={fromJS({extra_features: []})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render statistics because there is no filter', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                params={{view: 'overview'}}
                config={fromJS({
                    name: 'Overview',
                    link: 'overview',
                    stats: [],
                })}
                globalFilters={null}
                currentAccount={fromJS({extra_features: []})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render "Overview" statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                params={{view: 'overview'}}
                config={fromJS({
                    name: 'Overview',
                    link: 'overview',
                    stats: [],
                })}
                globalFilters={fromJS({agents: [1, 2]})}
                currentAccount={fromJS({extra_features: []})}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
