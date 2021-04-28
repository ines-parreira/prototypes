// @flow
import React, {type ComponentType} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {StatsPage} from '../StatsPage'

jest.mock('moment-timezone', () => {
    const moment = jest.requireActual('moment-timezone')
    return () => ({
        tz: (timezone) => {
            return moment('2019-09-03').tz(timezone)
        },
    })
})

jest.mock(
    '../../common/utils/withPaywall.tsx',
    () => () => (Component: ComponentType<any>) => () => {
        return <Component />
    }
)

describe('StatsPage', () => {
    const defaultProps = {
        config: fromJS({}),
        globalFilters: null,
        setStatsFilters: jest.fn(),
        resetStatsFilters: jest.fn(),
        storeIntegrations: fromJS([{id: 1}]),
        userTimezone: 'America/Los_Angeles',
    }

    describe('testing default filters', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should ensure the default value', () => {
            shallow(
                <StatsPage
                    {...defaultProps}
                    match={{params: {view: 'satisfaction'}}}
                />
            )
            expect(defaultProps.setStatsFilters).toMatchSnapshot()
        })

        it("should ensure the default period is using user's timezone", () => {
            shallow(
                <StatsPage
                    {...defaultProps}
                    match={{params: {view: 'satisfaction'}}}
                    userTimezone="Europe/Paris"
                />
            )
            expect(defaultProps.setStatsFilters).toMatchSnapshot()
        })
    })

    it('should ensure that on component unmount we reset the stats filters', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                match={{params: {view: 'satisfaction'}}}
            />
        )
        component.unmount()
        expect(defaultProps.resetStatsFilters).toHaveBeenCalled()
    })

    it('should render "Satisfaction" statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                match={{params: {view: 'satisfaction'}}}
                config={fromJS({
                    name: 'Satisfaction',
                    link: 'satisfaction',
                    stats: [],
                })}
                globalFilters={fromJS({})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render "Revenue" statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                match={{params: {view: 'revenue'}}}
                globalFilters={fromJS({integrations: [1]})}
                config={fromJS({
                    link: 'revenue',
                    stats: [],
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it("should restrict access to revenue stats because the account doesn't have a store integration", () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                match={{params: {view: 'revenue'}}}
                globalFilters={fromJS({})}
                config={fromJS({
                    link: 'revenue',
                    stats: [],
                })}
                storeIntegrations={fromJS([])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render statistics because there is no filter', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                match={{params: {view: 'overview'}}}
                config={fromJS({
                    name: 'Overview',
                    link: 'overview',
                    stats: [],
                })}
                globalFilters={null}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render "Overview" statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                match={{params: {view: 'overview'}}}
                config={fromJS({
                    name: 'Overview',
                    link: 'overview',
                    stats: [],
                })}
                globalFilters={fromJS({agents: [1, 2]})}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
