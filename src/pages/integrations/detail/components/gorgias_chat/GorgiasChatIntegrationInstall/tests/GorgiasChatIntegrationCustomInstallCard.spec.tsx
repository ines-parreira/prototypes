import React from 'react'
import {shallow} from 'enzyme'

import GorgiasChatIntegrationCustomInstallationCard from '../GorgiasChatIntegrationCustomInstallationCard'

describe('<GorgiasChatIntegrationCustomInstallationCard/>', () => {
    describe('render()', () => {
        it('should display the custom installation card correcty', () => {
            const component = shallow(
                <GorgiasChatIntegrationCustomInstallationCard
                    integrationId="1"
                    code="<script>installChat();</script>"
                    isShopifyChat={true}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })
})
