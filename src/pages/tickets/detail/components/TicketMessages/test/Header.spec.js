// @flow
import React from 'react'
import {shallow} from 'enzyme'
import Header from '../Header'
import Meta from '../Meta'
import {message} from '../../../../../../models/ticketElement/tests/mocks'

describe('Header', () => {
    it('should display header', () => {
        const component = shallow(
            <Header
                id="some-header"
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
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
            />
        )
        const messageId = component.find(Meta).prop('messageId')
        expect(messageId).toBe(message.message_id)
    })
})
