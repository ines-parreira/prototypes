import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ChatIntegrationPreview from './../ChatIntegrationPreview'

describe('ChatIntegrationPreview', () => {
    it('should display the properties correctly', () => {
        const component = shallow(
            <ChatIntegrationPreview
                name="My little chat integration"
                currentUser={fromJS({
                    name: 'Charles'
                })}
                introductionText="intro"
                inputPlaceholder="input"
                mainColor="#123456"
                conversationColor="#456789"
                icon="http://httpbin.org/image.jpg"
            />
        )

        expect(component).toMatchSnapshot()
    })
})
