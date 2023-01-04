import React from 'react'
import {shallow} from 'enzyme'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import StatsNavbarView from '../StatsNavbarView'

describe('StatsNavbarView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const component = shallow(<StatsNavbarView />)
        expect(component).toMatchSnapshot()
    })

    it('should render the new badge when having access to the beta', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsBetaTesters]: true,
        }))
        const component = shallow(<StatsNavbarView />)
        expect(component.find('Badge').exists()).toBe(true)
    })

    it('should render the link to Weekly ticket load when having access to the beta', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsBetaTesters]: true,
        }))
        const component = shallow(<StatsNavbarView />)
        expect(
            component
                .find('NavLink[to="/app/stats/weekly-ticket-load"]')
                .exists()
        ).toBe(true)
    })
})
