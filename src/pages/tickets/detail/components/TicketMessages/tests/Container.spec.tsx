import React from 'react'
import {shallow} from 'enzyme'
import moment from 'moment'

import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    message,
    duplicatedHiddenFacebookMessage,
} from 'models/ticket/tests/mocks'
import Container from '../Container'
import css from '../Container.less'

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({
    [FeatureFlagKey.TicketMessagesVirtualization]: true,
})

describe('Container', () => {
    it('should render container', () => {
        const component = shallow(
            <Container
                id="some-header"
                hasCursor={false}
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                lastMessageDatetimeAfterMount={moment('2017-01-01T12:12:34Z')}
                isMessageHidden={false}
                isMessageDeleted={false}
                isBodyHighlighted={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render container without an avatar because the message is hidden', () => {
        const component = shallow(
            <Container
                id="some-header"
                hasCursor={false}
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                lastMessageDatetimeAfterMount={moment('2017-01-01T12:12:34Z')}
                isMessageHidden={true}
                isMessageDeleted={false}
                isBodyHighlighted={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render container without an avatar because the message is deleted', () => {
        const component = shallow(
            <Container
                id="some-header"
                hasCursor={false}
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                lastMessageDatetimeAfterMount={moment('2017-01-01T12:12:34Z')}
                isMessageHidden={false}
                isMessageDeleted={true}
                isBodyHighlighted={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render container with isBodyHiglighted because it should be highlighted', () => {
        const component = shallow(
            <Container
                id="some-header"
                hasCursor={false}
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                lastMessageDatetimeAfterMount={moment('2020-01-01T12:12:34Z')}
                isMessageHidden={false}
                isMessageDeleted={true}
                isBodyHighlighted={true}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render container with an avatar because the hidden message is duplicated', () => {
        const component = shallow(
            <Container
                id="some-header"
                hasCursor={false}
                message={duplicatedHiddenFacebookMessage}
                timezone="America/Los_Angeles"
                isLastRead={false}
                lastMessageDatetimeAfterMount={moment('2017-01-01T12:12:34Z')}
                isMessageHidden={true}
                isMessageDeleted={false}
                isBodyHighlighted={false}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should have hasError class if message is failed', () => {
        const failedMessage = {
            ...message,
            failed_datetime: '2017-01-01T12:12:34Z',
        }
        const component = shallow(
            <Container
                id="some-header"
                hasCursor={false}
                message={message}
                timezone="America/Los_Angeles"
                isLastRead={false}
                lastMessageDatetimeAfterMount={moment('2017-01-01T12:12:34Z')}
                isMessageHidden={false}
                isMessageDeleted={false}
                isBodyHighlighted={false}
            />
        )
        expect(component).not.toHaveClassName(css.hasError)

        component.setProps({message: failedMessage})
        expect(component).toHaveClassName(css.hasError)
    })
})
