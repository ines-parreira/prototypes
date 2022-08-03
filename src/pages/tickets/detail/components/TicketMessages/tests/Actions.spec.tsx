import React from 'react'
import {render, fireEvent} from '@testing-library/react'

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
            {
                ...defaultAction,
                name: 'addTags',
                title: 'Add tags',
                arguments: {tags: 'tag1,tag2'},
            },
            {
                ...defaultAction,
                status: ActionStatus.Cancelled,
                name: 'setAssignee',
                title: 'Assign an agent',
                arguments: {assignee_user: 'User 1'},
            },
        ],
    }

    it('should display only actions with execution in back-end', () => {
        const {container} = render(<Actions message={message} />)
        // 6 actions + 1 header message
        expect((container.firstChild as HTMLDivElement).children).toHaveLength(
            7
        )
    })

    it('should display the action badge correctly', async () => {
        const {findByText} = render(<Actions message={message} />)
        expect(await findByText('action1')).toMatchSnapshot()
        expect(await findByText('Add tags: tag1, tag2')).toMatchSnapshot()
    })

    it('should display modal when hovering http or shopify action', async () => {
        const {findByText} = render(<Actions message={message} />)
        fireEvent.mouseOver(await findByText('action1'))
        expect(
            await findByText('Action failed.', {exact: false})
        ).toMatchSnapshot()
    })

    it('should open modal when clicking more details on http or shopify tooltip', async () => {
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
        const {findByText} = render(<Actions message={messageWithRefund} />)
        fireEvent.mouseOver(await findByText('Refund Action'))
        expect(
            await findByText('Action succeeded.', {exact: false})
        ).toMatchSnapshot()
        fireEvent.click(await findByText('More details'))
        expect((await findByText('order_id:')).closest('div')).toMatchSnapshot()
    })
})
