import React from 'react'

import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS4Flag } from '@repo/tickets/feature-flags'
import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import TicketsListPanel from '../TicketsListPanel'

jest.mock('react-router-dom', () => ({ useParams: jest.fn() }))
const useParamsMock = assumeMock(useParams)

jest.mock('@repo/tickets/feature-flags', () => ({
    useHelpdeskV2MS4Flag: jest.fn(),
}))
const useHelpdeskV2MS4FlagMock = assumeMock(useHelpdeskV2MS4Flag)

jest.mock('ticket-list-view', () => ({
    TicketListView: ({
        activeTicketId,
        viewId,
    }: {
        activeTicketId?: number
        viewId: number
    }) => (
        <div>
            <p>TicketListView</p>
            <p>viewId: {viewId}</p>
            <p>activeTicketId: {activeTicketId}</p>
        </div>
    ),
}))
jest.mock('tickets/core/hooks', () => ({ useViewId: () => 123456 }))

describe('TicketsListPanel', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({})
        useHelpdeskV2MS4FlagMock.mockReturnValue(false)
    })

    it('should render the ticket list view without a ticket id', () => {
        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )
        expect(screen.getByText('TicketListView')).toBeInTheDocument()
        expect(screen.getByText('viewId: 123456')).toBeInTheDocument()
        expect(screen.getByText('activeTicketId:')).toBeInTheDocument()
    })

    it('should render the ticket list view with a ticket id', () => {
        useParamsMock.mockReturnValue({ ticketId: '789987' })
        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )
        expect(screen.getByText('activeTicketId: 789987')).toBeInTheDocument()
    })

    it('should render placeholder when MS4 flag is enabled', () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(true)
        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )
        expect(screen.getByText('PLACEHOLDER')).toBeInTheDocument()
        expect(screen.queryByText('TicketListView')).not.toBeInTheDocument()
    })

    it('should render TicketListView when MS4 flag is disabled', () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(false)
        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )
        expect(screen.getByText('TicketListView')).toBeInTheDocument()
        expect(screen.queryByText('PLACEHOLDER')).not.toBeInTheDocument()
    })
})
