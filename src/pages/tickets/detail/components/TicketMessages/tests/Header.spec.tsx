import React from 'react'
import {shallow} from 'enzyme'

import Header from '../Header.js'
import Meta from '../Meta.js'
import {
    message,
    duplicatedHiddenFacebookMessage,
} from '../../../../../../models/ticket/tests/mocks'

describe('Header', () => {
    it('should display header', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                isMessageHidden={false}
                isMessageDeleted={false}
                showIntents={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display header with metaContent = "Message hidden"', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                isMessageHidden={true}
                isMessageDeleted={false}
                showIntents={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not display header with metaContent = "Message hidden" because the message is duplicated', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={duplicatedHiddenFacebookMessage}
                timezone="America/Los_Angeles"
                isLastRead={false}
                isMessageHidden={true}
                isMessageDeleted={false}
                showIntents={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display header with metaContent = "Comment deleted on Facebook"', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                isMessageHidden={false}
                isMessageDeleted={true}
                showIntents={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should pass the correct message id to Meta', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                isMessageHidden={false}
                isMessageDeleted={false}
                showIntents={false}
            />
        )
        const messageId = component.find(Meta).prop('messageId')
        expect(messageId).toBe(message.message_id)
    })
    it('should correctly display intents', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                isMessageHidden={false}
                isMessageDeleted={false}
                showIntents={true}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
