import React from 'react'
import {fromJS, Map} from 'immutable'
import {mount} from 'enzyme'

import FacebookIntegrationNavigation from '../FacebookIntegrationNavigation'
import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../constants/integration'

describe('<FacebookIntegrationNavigation/>', () => {
    it('should not display the Ads tab when ads are disabled', () => {
        const integration: Map<any, any> = fromJS({
            id: 1,
            type: FACEBOOK_INTEGRATION_TYPE,
        })

        const component = mount(
            <FacebookIntegrationNavigation integration={integration} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display the Ads tab when Instagram ads are enabled', () => {
        const integration: Map<any, any> = fromJS({
            id: 1,
            type: FACEBOOK_INTEGRATION_TYPE,
            meta: {
                settings: {
                    instagram_ads_enabled: true,
                },
            },
        })

        const component = mount(
            <FacebookIntegrationNavigation integration={integration} />
        )
        expect(component).toMatchSnapshot()
    })
})
