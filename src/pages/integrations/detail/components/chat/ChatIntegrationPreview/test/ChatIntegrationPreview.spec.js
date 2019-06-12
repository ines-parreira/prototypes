import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT} from '../../../../../../../config/integrations/smooch_inside'

import ChatIntegrationPreview from '../ChatIntegrationPreview'
import MessageContent from '../MessageContent'
import OptionalEmailCapture from '../OptionalEmailCapture'
import QuickReplies from '../QuickReplies'
import RequiredEmailCapture from '../RequiredEmailCapture'


const mainColor = '#123456'
const conversationColor = '#456789'
const currentUser = fromJS({name: 'Charles'})



describe('ChatIntegrationPreview', () => {
    it('should display the online status because chat is online', () => {
        const component = mount(
            <ChatIntegrationPreview
                name="My little chat integration"
                currentUser={currentUser}
                introductionText="intro"
                mainColor={mainColor}
                isOnline={true}
                language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
            >
                <MessageContent
                    conversationColor={conversationColor}
                    currentUser={currentUser}
                />
            </ChatIntegrationPreview>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the offline status because chat is offline', () => {
        const component = mount(
            <ChatIntegrationPreview
                name="My little chat integration"
                currentUser={currentUser}
                introductionText="intro"
                mainColor={mainColor}
                isOnline={false}
                language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
            >
                <MessageContent
                    conversationColor={conversationColor}
                    currentUser={currentUser}
                />
            </ChatIntegrationPreview>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display quickReplies', () => {
        const component = mount(
            <ChatIntegrationPreview
                name="My little chat integration"
                introductionText="intro"
                mainColor={mainColor}
                isOnline
                language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
            >
                <QuickReplies
                    quickReplies={fromJS(['foo', 'bar'])}
                    mainColor={mainColor}
                />
            </ChatIntegrationPreview>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display optional email capture', () => {
        const component = mount(
            <ChatIntegrationPreview
                name="My little chat integration"
                introductionText="intro"
                mainColor="#123456"
                conversationColor="#456789"
                optionalEmailCapture={true}
                isOnline
                language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
            >
                <OptionalEmailCapture
                    conversationColor={conversationColor}
                    name="My little chat integration"
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                />
            </ChatIntegrationPreview>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display required email capture', () => {
        const component = mount(
            <ChatIntegrationPreview
                name="My little chat integration"
                introductionText="intro"
                mainColor="#123456"
                conversationColor="#456789"
                requiredEmailCapture={true}
                isOnline
                language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                renderFooter={false}
            >
                <RequiredEmailCapture
                    conversationColor={conversationColor}
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                />
            </ChatIntegrationPreview>
        )

        expect(component).toMatchSnapshot()
    })
})
