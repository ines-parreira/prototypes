// @flow
import React from 'react'
import {shallow} from 'enzyme'

import Header from '../Header'
import Meta from '../Meta'
import {message} from '../../../../../../models/ticket/tests/mocks'

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
            />
        )
        const messageId = component.find(Meta).prop('messageId')
        expect(messageId).toBe(message.message_id)
    })
})
