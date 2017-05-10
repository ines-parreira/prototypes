import React from 'react'
import {shallow} from 'enzyme'

import TicketMessageActions from '../TicketMessageActions'

describe('TicketMessageActions component', () => {
    const args = {
        headers: {
            Authorization: 'auth',
            ContentType: 'application/json'
        },
        params: {
            userId: 1,
            accoundId: 4,
            otherId: 8,
            anyId: 12
        }
    }

    const message = {
        actions: [
            {name: 'setResponseText'},
            {name: 'http', status: 'pending', title: 'action1', arguments: args},
            {name: 'http', status: 'error', title: 'action2', arguments: args},
            {name: 'http', status: 'canceled', title: 'action3', arguments: args},
            {name: 'http', status: 'success', title: 'action4', arguments: args}
        ]
    }

    let component = shallow(
        <TicketMessageActions
            message={message}
        />
    )

    it('should display only actions with execution in back-end', () => {
        expect(component.children().length).toBe(4)
    })

    it('should display actions titles', () => {
        const action1Title = component.find('.ticket-message-actions-item Button').at(0).children().at(1)
        expect(action1Title).toIncludeText('action1')

        const action3Title = component.find('.ticket-message-actions-item Button').at(2).children().at(1)
        expect(action3Title).toIncludeText('action3')
    })
})
