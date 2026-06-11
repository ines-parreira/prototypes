import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import type { SourceWrapper } from '../../../common/components/sourceWidgets/SourceWrapper'
import { TicketSourceContainer } from '../TicketSourceContainer'

jest.mock('../../../common/components/sourceWidgets/SourceWrapper', () => ({
    SourceWrapper: ({
        context,
        identifier,
    }: ComponentProps<typeof SourceWrapper>) => (
        <div>
            SourceWrapper
            <div>context: {JSON.stringify(context)}</div>
            <div>identifier: {JSON.stringify(identifier)}</div>
        </div>
    ),
}))

describe('<TicketSourceContainer />', () => {
    const minProps = {
        actions: {
            fetchCustomer: jest.fn(),
            fetchTicket: jest.fn(),
            widgets: {
                cancelDrag: jest.fn(),
                drag: jest.fn(),
                drop: jest.fn(),
                fetchWidgets: jest.fn(),
                generateAndSetWidgets: jest.fn(),
                removeEditedWidget: jest.fn(),
                resetWidgets: jest.fn(),
                selectContext: jest.fn(),
                setEditedWidgets: jest.fn(),
                setEditionAsDirty: jest.fn(),
                startEditionMode: jest.fn(),
                startWidgetEdition: jest.fn(),
                stopEditionMode: jest.fn(),
                stopWidgetEdition: jest.fn(),
                submitWidgets: jest.fn(),
                updateEditedWidget: jest.fn(),
                updateCustomActions: jest.fn(),
            },
        },
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
        ticket: fromJS({}),
        widgets: fromJS({}),
    }

    it('should render', () => {
        const { container } = render(<TicketSourceContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/32'],
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch ticket on initial render', () => {
        render(<TicketSourceContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/32'],
        })

        expect(minProps.actions.fetchTicket).toHaveBeenCalledWith('32', {
            isCurrentlyOnTicket: true,
        })
    })

    it('should fetch the customer if ticket is new, customer is provided through the URL and is different from the one in the ticket', () => {
        const customerId = 12
        render(<TicketSourceContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: [`/foo/new?customer=${customerId}`],
        })

        expect(minProps.actions.fetchCustomer).toHaveBeenCalledWith(
            customerId.toString(),
        )
    })
})
