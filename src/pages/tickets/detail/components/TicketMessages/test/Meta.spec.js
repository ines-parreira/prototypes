//@flow
import {shallow} from 'enzyme'
import React from 'react'
import Meta from '../Meta'

describe('ticket message meta', () => {
    it('should add a -sent via rule- label because the message was sent by a rule', () => {
        const component = shallow(
            <Meta
                messageId="some-id"
                via="rule"
                ruleId='4'
            />
        )
        const fromVia = component.find('From')

        const html = fromVia.render()
        html.find('.material-icons').remove()
        expect(html.text()).toBe('sent via a Rule')
    })

    it('should add a -sent via campaign- label because the message was sent by a campaign', () => {
        const component = shallow(
            <Meta
                messageId="some-id"
                via="something"
                integrationId="118"
                meta={{
                    campaign_id: '123'
                }}
            />
        )
        const fromVia = component.find('From')

        const html = fromVia.render()
        html.find('.material-icons').remove()
        expect(html.text()).toBe('sent via a Campaign')
    })
})
