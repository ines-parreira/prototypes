import React from 'react'

import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { Panels } from 'core/layout/panels'
import { assumeMock } from 'utils/testing'

import TicketsListPanel from '../TicketsListPanel'

jest.mock('react-router-dom', () => ({ useParams: jest.fn() }))
const useParamsMock = assumeMock(useParams)

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
})
