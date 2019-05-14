import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS} from '../../../../../../../config/integrations/chat'

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
                mainColor="#123456"
                conversationColor="#456789"
                isOnline={true}
                translatedTexts={SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS}
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
                mainColor="#123456"
                conversationColor="#456789"
                isOnline={false}
                translatedTexts={SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display quickReplies', () => {
        const component = shallow(
            <ChatIntegrationPreview
                name="My little chat integration"
                introductionText="intro"
                mainColor="#123456"
                conversationColor="#456789"
                quickReplies={fromJS(['foo', 'bar'])}
                isOnline
                translatedTexts={SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
