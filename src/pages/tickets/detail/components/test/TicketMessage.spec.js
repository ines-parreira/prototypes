import React from 'react'
import {shallow} from 'enzyme'
import {TicketMessage} from '../TicketMessage'

const commonProps = {
    loading: false,
    lastMessageDatetimeAfterMount: {},
    ticket: {},
    setStatus: () => {},
    executeAction: () => {},
    isLastReadMessage: false,
    hasCursor: false
}

describe('TicketMessage component', () => {
    it('should add a -sent via a rule- label with a link because the message was sent by a rule', () => {
        const component = shallow(
            <TicketMessage
                {...commonProps}
                message={{
                    via: 'rule',
                    rule_id: 4
                }}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should add a -sent via a campaign- label with a link because the message was sent by a campaign', () => {
        const component = shallow(
            <TicketMessage
                {...commonProps}
                message={{
                    meta: {campaign_id: '123'},
                    integration_id: '118'
                }}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should add a -sent via email- label with no link because the message is an internal note sent via email', () => {
        const component = shallow(
            <TicketMessage
                {...commonProps}
                message={{
                    source: {type: 'internal-note'},
                    via: 'email'
                }}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
