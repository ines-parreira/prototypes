import React from 'react'
import {shallow} from 'enzyme'

import CustomInstallationShopifyTab from '../CustomInstallationShopifyTab'

describe('<CustomInstallationShopifyTab/>', () => {
    it('should display the custom installation "shopify tab" when ssp is not available correcty', () => {
        const component = shallow(
            <CustomInstallationShopifyTab
                integrationId="1"
                code="<script>installChat();</script>"
                sspAvailable={false}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the custom installation "shopify tab" when ssp is available correcty', () => {
        const component = shallow(
            <CustomInstallationShopifyTab
                integrationId="1"
                code="<script>installChat();</script>"
                sspAvailable={true}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
