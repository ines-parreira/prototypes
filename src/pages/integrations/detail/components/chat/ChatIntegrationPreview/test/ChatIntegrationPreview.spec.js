import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ChatIntegrationPreview from './../ChatIntegrationPreview'

describe('ChatIntegrationPreview', () => {
    it('should display the online status because chat is online', () => {
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
                offlineStatusEnabled={true}
                isOnline={true}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the offline status because chat is offline and offline status is enabled', () => {
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
                offlineStatusEnabled={true}
                isOnline={false}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the offline status with online colors because chat is offline and offline status is disabled',
    () => {
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
                offlineStatusEnabled={false}
                isOnline={false}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
