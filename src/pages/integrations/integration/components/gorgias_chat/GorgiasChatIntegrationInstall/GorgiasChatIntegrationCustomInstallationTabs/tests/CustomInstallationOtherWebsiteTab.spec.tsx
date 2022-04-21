import React from 'react'
import {shallow} from 'enzyme'

import CustomInstallationOtherWebsiteTab from '../CustomInstallationOtherWebsiteTab'

describe('<CustomInstallationOtherWebsiteTab/>', () => {
    it('should display the custom installation "other website" tab correcty', () => {
        const component = shallow(
            <CustomInstallationOtherWebsiteTab code="<script>installChat();</script>" />
        )

        expect(component).toMatchSnapshot()
    })
})
