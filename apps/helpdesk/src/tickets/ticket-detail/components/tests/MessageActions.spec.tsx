import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MacroActionName } from 'models/macroAction/types'
import {
    action as defaultAction,
    message as defaultMessage,
} from 'models/ticket/tests/mocks'
import type { Action } from 'models/ticket/types'
import { ActionStatus } from 'models/ticket/types'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'

import { MessageActions } from '../MessageActions'

jest.mock('timeline/ticket-modal/hooks/useTicketModalContext', () => ({
    useTicketModalContext: jest.fn(),
}))

const useTicketModalContextMock = jest.mocked(useTicketModalContext)

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

    beforeEach(() => {
        useTicketModalContextMock.mockReturnValue({
            isInsideTicketModal: false,
            containerRef: null,
            isInsideSidePanel: false,
        })
    })

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

    it('should not display tooltip when hovering http or shopify action in ticket modal', () => {
        useTicketModalContextMock.mockReturnValue({
            isInsideTicketModal: true,
            containerRef: null,
            isInsideSidePanel: false,
        })

        render(<MessageActions message={message} />)
        fireEvent.mouseOver(screen.getByText('action1'))

        expect(
            screen.queryByText('Action failed.', { exact: false }),
        ).not.toBeInTheDocument()
    })

    it('should display tooltip when hovering http or shopify action', async () => {
        render(<MessageActions message={message} />)
        fireEvent.mouseOver(screen.getByText('action1'))

        expect(
            await screen.findByText('Action failed.', { exact: false }),
        ).toBeInTheDocument()
    })

    it('should handle the display of a shopify modal', async () => {
        const minArguments = {
            restock: true,
            order_id: 1234,
            object_value: {
                key: 'is displayed',
            },
            tracking_event_name: 'not displayed',
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
        expect(
            screen.getByText('is displayed', { exact: false }),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('tracking_event_name:'),
        ).not.toBeInTheDocument()

        // should close the modal
        fireEvent.click(screen.getByText('close'))

        await waitFor(() => {
            expect(screen.queryByText('order_id:')).not.toBeInTheDocument()
        })
    })

    it('should handle the display of a http modal', async () => {
        const messageWithHttp: TicketMessage = {
            ...defaultMessage,
            actions: [
                {
                    ...defaultAction,
                    name: MacroActionName.Http,
                    title: 'HTTP Action',
                    arguments: {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer token123',
                        },
                        params: {
                            userId: '123',
                            action: 'update',
                        },
                        form: {
                            name: 'John Doe',
                            email: 'john@example.com',
                        },
                        content_type: 'form',
                    },
                    response: {
                        status_code: 200,
                        response: '{"success": true}',
                    },
                },
            ],
        } as TicketMessage

        render(<MessageActions message={messageWithHttp} />)
        fireEvent.mouseOver(screen.getByText('HTTP Action'))

        expect(
            await screen.findByText('Action succeeded.', { exact: false }),
        ).toBeInTheDocument()

        fireEvent.click(await screen.findByText('More details'))

        expect(screen.getByText('Authorization:')).toBeInTheDocument()
        expect(screen.getByText('Bearer token123')).toBeInTheDocument()
        expect(screen.getByText('URL Parameters')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()
        expect(screen.getByText('update')).toBeInTheDocument()
        expect(screen.getByText('Response')).toBeInTheDocument()
        expect(screen.getByText('{"success": true}')).toBeInTheDocument()
    })

    it('should cover several cases of action arguments', () => {
        const messageWithNoArg = {
            ...defaultMessage,
            actions: [
                {
                    ...defaultAction,
                    name: MacroActionName.SetPriority,
                    title: 'Set Priority',
                    arguments: { priority: '' },
                },
                {
                    ...defaultAction,
                    name: MacroActionName.SetAssignee,
                    title: 'Assign an agent',
                    arguments: { assignee_user: { name: 'Agent Smith' } },
                },
                {
                    ...defaultAction,
                    name: MacroActionName.SetAssignee,
                    title: 'Assign an agent',
                    arguments: { assignee_user: { id: 123 } },
                },
            ],
        } as TicketMessage
        render(<MessageActions message={messageWithNoArg} />)
        expect(screen.getByText('Set Priority: None')).toBeInTheDocument()
        expect(
            screen.getByText('Assign an agent: Agent Smith'),
        ).toBeInTheDocument()
        expect(screen.getByText('Assign an agent: None')).toBeInTheDocument()
    })
})
