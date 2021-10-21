import React from 'react'
import {shallow} from 'enzyme'

import CustomInstallationGTMTab from '../CustomInstallationGTMTab'
import {renderChatCodeSnippet} from '../../../renderChatCodeSnippet.js'

describe('<CustomInstallationGTMTab/>', () => {
    it('should display the custom installation "GTM tab" correcty', () => {
        const code = renderChatCodeSnippet({chatAppId: 342})
        const component = shallow(<CustomInstallationGTMTab code={code} />)

        expect(component).toMatchSnapshot()
    })
})
