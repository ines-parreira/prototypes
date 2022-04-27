import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import CustomInstallationGTMTab from '../CustomInstallationGTMTab'
import {renderChatCodeSnippet} from '../../../renderChatCodeSnippet'

describe('<CustomInstallationGTMTab/>', () => {
    it('should display the custom installation "GTM tab" correcty', () => {
        const code = renderChatCodeSnippet({
            chatAppId: '342',
            gorgiasChatExtraState: fromJS({}),
        })
        const component = shallow(<CustomInstallationGTMTab code={code} />)

        expect(component).toMatchSnapshot()
    })
})
