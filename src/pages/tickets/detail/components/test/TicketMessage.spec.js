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
    it('should add a -sent via rule- label because the message was sent by a rule', () => {
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

    it('should add a -sent via campaign- label because the message was sent by a campaign', () => {
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
})
