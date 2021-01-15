import React, {ComponentType} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {StatsPage} from '../StatsPage'

jest.mock('moment', () => {
    return () => require.requireActual('moment')('2019-09-03')
})

jest.mock(
    '../../common/utils/withPaywall.tsx',
    () => () => (Component: ComponentType<any>) => () => {
        return <Component />
    }
)

describe('StatsPage', () => {
    const defaultProps = {
        globalFilters: null,
        setStatsFilters: jest.fn(),
        resetStatsFilters: jest.fn(),
        storeIntegrations: fromJS([]),
    }

    describe('testing default filters', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should ensure the default value', () => {
            shallow(
                <StatsPage {...defaultProps} params={{view: 'satisfaction'}} />
            )
            expect(defaultProps.setStatsFilters).toMatchSnapshot()
        })

        it('should ensure that the filters contain a store integration when possible', () => {
            shallow(
                <StatsPage
                    {...defaultProps}
                    params={{view: 'satisfaction'}}
                    storeIntegrations={fromJS([{id: 1}, {id: 2}, {id: 3}])}
                />
            )
            expect(defaultProps.setStatsFilters).toMatchSnapshot()
        })
    })

    it('should ensure that on component unmount we reset the stats filters', () => {
        const component = shallow(
            <StatsPage {...defaultProps} params={{view: 'satisfaction'}} />
        )
        component.unmount()
        expect(defaultProps.resetStatsFilters).toHaveBeenCalled()
    })

    it('should render "Satisfaction" statistics', () => {
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
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render "Revenue" statistics', () => {
        const component = shallow(
            <StatsPage
                {...defaultProps}
                params={{view: 'revenue'}}
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
                params={{view: 'revenue'}}
                globalFilters={fromJS({})}
                config={fromJS({
                    link: 'revenue',
                    stats: [],
                })}
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
            />
        )

        expect(component).toMatchSnapshot()
    })
})
