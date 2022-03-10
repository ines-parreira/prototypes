import React from 'react'
import {mount} from 'enzyme'

import Button from 'pages/common/components/button/Button'
import {Action, ActionStatus, TicketMessage} from 'models/ticket/types'
import {
    action as defaultAction,
    message as defaultMessage,
} from 'models/ticket/tests/mocks'

import Actions from '../Actions'

describe('Actions component', () => {
    const args: Action['arguments'] = {
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

    const message: TicketMessage = {
        ...defaultMessage,
        actions: [
            {
                ...defaultAction,
                status: ActionStatus.Pending,
                name: 'setResponseText',
            },
            {
                ...defaultAction,
                status: ActionStatus.Cancelled,
                name: 'http',
                title: 'action1',
                arguments: args,
            },
            {
                ...defaultAction,
                status: ActionStatus.Error,
                name: 'http',
                title: 'action2',
                arguments: args,
            },
            {
                ...defaultAction,
                status: ActionStatus.Error,
                name: 'http',
                title: 'action3',
                arguments: args,
            },
            {
                ...defaultAction,
                name: 'http',
                title: 'action4',
                arguments: args,
            },
        ],
    }

    let component = mount(<Actions message={message} />)

    it('should display only actions with execution in back-end', () => {
        expect(component.find(Button).length).toBe(4)
    })

    it('should display actions titles', () => {
        const action1Button = component.find('button').at(0)
        expect(action1Button).toIncludeText('action1')

        const action3Button = component.find('button').at(2)
        expect(action3Button).toIncludeText('action3')
    })

    it('should display modal with shopify action details', () => {
        const minArguments = {
            restock: true,
            order_id: 1234,
        }
        const messageWithRefund: TicketMessage = {
            ...defaultMessage,
            actions: [
                {
                    ...defaultAction,
                    name: 'shopifyFullRefundLastOrder',
                    title: 'Refund Action',
                    arguments: minArguments,
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
