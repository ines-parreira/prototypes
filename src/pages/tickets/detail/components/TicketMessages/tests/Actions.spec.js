import React from 'react'
import {mount} from 'enzyme'

import Actions from '../Actions'

describe('Actions component', () => {
    const args = {
        headers: {
            Authorization: 'auth',
            ContentType: 'application/json',
        },
        params: {
            userId: 1,
            accoundId: 4,
            otherId: 8,
            anyId: 12,
        },
    }

    const message = {
        actions: [
            {name: 'setResponseText'},
            {
                name: 'http',
                status: 'pending',
                title: 'action1',
                arguments: args,
            },
            {name: 'http', status: 'error', title: 'action2', arguments: args},
            {
                name: 'http',
                status: 'canceled',
                title: 'action3',
                arguments: args,
            },
            {
                name: 'http',
                status: 'success',
                title: 'action4',
                arguments: args,
            },
        ],
    }

    let component = mount(<Actions message={message} />)

    it('should display only actions with execution in back-end', () => {
        expect(component.find('Button').length).toBe(4)
    })

    it('should display actions titles', () => {
        const action1Button = component.find('button').at(0)
        expect(action1Button).toIncludeText('action1')

        const action3Button = component.find('button').at(2)
        expect(action3Button).toIncludeText('action3')
    })

    it('should display modal with shopify action details', () => {
        let messageWithRefund = {
            actions: [
                {
                    name: 'shopifyFullRefundLastOrder',
                    type: 'user',
                    status: 'success',
                    title: 'Refund Action',
                    arguments: {restock: true, order_id: 1234},
                },
            ],
        }
        component = mount(<Actions message={messageWithRefund} />)

        const refundActionButton = component.find('button').at(0)
        expect(refundActionButton).toIncludeText('Refund Action')
        refundActionButton.simulate('click')

        const modalHeader = component.find('.modal-header').at(0)
        expect(modalHeader).toIncludeText('Options')
        const modalContent = component.find('.modal-content').at(0)
        expect(modalContent).toIncludeText('restock: trueorder_id: 1234')
    })
})
