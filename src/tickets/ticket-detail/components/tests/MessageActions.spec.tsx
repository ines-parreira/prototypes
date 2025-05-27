import { fireEvent, render, screen } from '@testing-library/react'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { MacroActionName } from 'models/macroAction/types'
import {
    action as defaultAction,
    message as defaultMessage,
} from 'models/ticket/tests/mocks'
import { Action, ActionStatus } from 'models/ticket/types'

import MessageActions from '../MessageActions'

describe('MessageActions', () => {
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

    const message = {
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
                arguments: { tags: 'tag1,tag2' },
            },
            {
                ...defaultAction,
                status: ActionStatus.Cancelled,
                name: MacroActionName.SetAssignee,
                title: 'Assign an agent',
                arguments: { assignee_user: 'User 1' },
            },
        ],
    } as TicketMessage

    it('should display only actions with execution in back-end', () => {
        const { container } = render(<MessageActions message={message} />)
        // 6 actions + 1 header message
        expect((container.firstChild as HTMLDivElement).children).toHaveLength(
            7,
        )
    })

    it('should display the action badge', () => {
        render(<MessageActions message={message} />)
        expect(screen.getByText('action1')).toBeInTheDocument()
        expect(screen.getByText('Add tags: tag1, tag2')).toBeInTheDocument()
    })

    it('should display the action badge without arguments - ExcludeFromAutoMerge', () => {
        const title = 'Exclude ticket from Auto-Merge'
        const messageWithExcludedAutoMerge = {
            ...defaultMessage,
            actions: [
                {
                    ...defaultAction,
                    name: MacroActionName.ExcludeFromAutoMerge,
                    title,
                },
            ],
        } as TicketMessage

        render(<MessageActions message={messageWithExcludedAutoMerge} />)
        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should display the action badge without arguments - ExcludeFromCSAT', () => {
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
        } as TicketMessage

        render(<MessageActions message={messageWithExcludedCSAT} />)

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should display modal when hovering http or shopify action', async () => {
        render(<MessageActions message={message} />)
        fireEvent.mouseOver(screen.getByText('action1'))

        expect(
            await screen.findByText('Action failed.', { exact: false }),
        ).toBeInTheDocument()
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
        } as TicketMessage

        render(<MessageActions message={messageWithRefund} />)
        fireEvent.mouseOver(screen.getByText('Refund Action'))

        expect(
            await screen.findByText('Action succeeded.', { exact: false }),
        ).toBeInTheDocument()

        fireEvent.click(await screen.findByText('More details'))

        expect(screen.getByText('order_id:')).toBeInTheDocument()
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
        } as TicketMessage

        render(<MessageActions message={messageWithRefund} />)
        fireEvent.mouseOver(screen.getByText('Refund Action'))
        fireEvent.click(await screen.findByText('More details'))

        expect(screen.getByText('order_id:').closest('div')).toBeInTheDocument()
    })
})
