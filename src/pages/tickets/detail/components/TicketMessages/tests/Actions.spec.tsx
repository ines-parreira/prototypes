import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {MacroActionName} from 'models/macroAction/types'
import {
    action as defaultAction,
    message as defaultMessage,
} from 'models/ticket/tests/mocks'
import {Action, ActionStatus, TicketMessage} from 'models/ticket/types'

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
                name: MacroActionName.SetResponseText,
            },
            {
                ...defaultAction,
                status: ActionStatus.Cancelled,
                name: MacroActionName.Http,
                title: 'action1',
                arguments: args,
            },
            {
                ...defaultAction,
                status: ActionStatus.Error,
                name: MacroActionName.Http,
                title: 'action2',
                arguments: args,
            },
            {
                ...defaultAction,
                status: ActionStatus.Error,
                name: MacroActionName.Http,
                title: 'action3',
                arguments: args,
            },
            {
                ...defaultAction,
                name: MacroActionName.Http,
                title: 'action4',
                arguments: args,
            },
            {
                ...defaultAction,
                name: MacroActionName.AddTags,
                title: 'Add tags',
                arguments: {tags: 'tag1,tag2'},
            },
            {
                ...defaultAction,
                status: ActionStatus.Cancelled,
                name: MacroActionName.SetAssignee,
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

    it('should display the action badge without arguments', async () => {
        const title = 'Exclude ticket from CSAT'
        const messageWithExcludedCSAT: TicketMessage = {
            ...defaultMessage,
            actions: [
                {
                    ...defaultAction,
                    name: MacroActionName.ExcludeFromCSAT,
                    title,
                },
            ],
        }

        const {findByText} = render(
            <Actions message={messageWithExcludedCSAT} />
        )
        expect(await findByText(title)).toMatchSnapshot()
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
                    name: MacroActionName.ShopifyFullRefundLastOrder,
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

    it('should not crash when passing objects to Shopify actions', async () => {
        const minArguments = {
            restock: true,
            order_id: 1234,
            object_value: {
                key: 'value',
            },
        }
        const messageWithRefund: TicketMessage = {
            ...defaultMessage,
            actions: [
                {
                    ...defaultAction,
                    name: MacroActionName.ShopifyFullRefundLastOrder,
                    title: 'Refund Action',
                    arguments: minArguments,
                },
            ],
        }
        const {findByText} = render(<Actions message={messageWithRefund} />)
        fireEvent.mouseOver(await findByText('Refund Action'))
        fireEvent.click(await findByText('More details'))
        expect((await findByText('order_id:')).closest('div')).toMatchSnapshot()
    })
})
