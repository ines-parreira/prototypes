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
                isOnline={true}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the offline status because chat is offline', () => {
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
                isOnline={false}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display quickReplies', () => {
        const component = shallow(
            <ChatIntegrationPreview
                name="My little chat integration"
                introductionText="intro"
                inputPlaceholder="input"
                mainColor="#123456"
                conversationColor="#456789"
                quickReplies={fromJS(['foo', 'bar'])}
                isOnline
            />
        )

        expect(component).toMatchSnapshot()
    })
})
