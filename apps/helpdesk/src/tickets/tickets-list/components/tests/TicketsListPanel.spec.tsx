import React from 'react'

import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS4Flag } from '@repo/tickets/feature-flags'
import { act, render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import TicketsListPanel from '../TicketsListPanel'

jest.mock('react-router-dom', () => ({ useParams: jest.fn() }))
const useParamsMock = assumeMock(useParams)

jest.mock('@repo/tickets/feature-flags', () => ({
    useHelpdeskV2MS4Flag: jest.fn(),
}))
const useHelpdeskV2MS4FlagMock = assumeMock(useHelpdeskV2MS4Flag)

jest.mock('@repo/tickets', () => ({
    useCurrentUserId: jest.fn(() => ({ currentUserId: 999 })),
}))

jest.mock('@repo/tickets/ticket-list', () => ({
    TicketList: ({
        activeTicketId,
        viewId,
        currentUserId,
        onApplyMacro,
    }: {
        activeTicketId?: number
        viewId: number
        currentUserId: number
        onApplyMacro?: (ticketIds: number[]) => void
    }) => (
        <div>
            <p>TicketList</p>
            <p>viewId: {viewId}</p>
            <p>activeTicketId: {activeTicketId}</p>
            <p>currentUserId: {currentUserId}</p>
            <button onClick={() => onApplyMacro?.([1, 2, 3])}>
                Open macro
            </button>
        </div>
    ),
}))

jest.mock('ticket-list-view/components/bulk-actions/ApplyMacro', () => ({
    __esModule: true,
    default: ({
        setIsOpen,
        onApplyMacro,
    }: {
        setIsOpen: (v: boolean) => void
        onApplyMacro: () => void
    }) => (
        <div>
            <p>ApplyMacro</p>
            <button onClick={() => setIsOpen(false)}>Close macro</button>
            <button onClick={onApplyMacro}>Apply macro</button>
        </div>
    ),
}))

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
jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView', () => ({
    __esModule: true,
    default: jest.fn(() => ({ setIsEnabled: jest.fn() })),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

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
        expect(screen.getByText('TicketListView')).toBeInTheDocument()
        expect(screen.getByText('viewId: 123456')).toBeInTheDocument()
        expect(screen.getByText('activeTicketId: 789987')).toBeInTheDocument()
    })

    it('should render TicketList when MS4 flag is enabled', () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(true)
        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )
        expect(screen.getByText('TicketList')).toBeInTheDocument()
        expect(screen.getByText('viewId: 123456')).toBeInTheDocument()
        expect(screen.getByText('currentUserId: 999')).toBeInTheDocument()
        expect(screen.queryByText('TicketListView')).not.toBeInTheDocument()
    })

    describe('Apply macro (MS4)', () => {
        beforeEach(() => {
            useHelpdeskV2MS4FlagMock.mockReturnValue(true)
        })

        it('does not render ApplyMacro initially', () => {
            render(
                <Panels size={1000}>
                    <TicketsListPanel />
                </Panels>,
            )
            expect(screen.queryByText('ApplyMacro')).not.toBeInTheDocument()
        })

        it('renders ApplyMacro when TicketList calls onApplyMacro', async () => {
            render(
                <Panels size={1000}>
                    <TicketsListPanel />
                </Panels>,
            )
            screen.getByRole('button', { name: 'Open macro' }).click()
            expect(await screen.findByText('ApplyMacro')).toBeInTheDocument()
        })

        it('hides ApplyMacro when setIsOpen is called with false', async () => {
            render(
                <Panels size={1000}>
                    <TicketsListPanel />
                </Panels>,
            )
            screen.getByRole('button', { name: 'Open macro' }).click()
            await screen.findByText('ApplyMacro')
            act(() => {
                screen.getByRole('button', { name: 'Close macro' }).click()
            })
            expect(screen.queryByText('ApplyMacro')).not.toBeInTheDocument()
        })

        it('hides ApplyMacro when the macro is applied', async () => {
            render(
                <Panels size={1000}>
                    <TicketsListPanel />
                </Panels>,
            )
            screen.getByRole('button', { name: 'Open macro' }).click()
            await screen.findByText('ApplyMacro')
            act(() => {
                screen.getByRole('button', { name: 'Apply macro' }).click()
            })
            expect(screen.queryByText('ApplyMacro')).not.toBeInTheDocument()
        })
    })

    it('should render TicketListView when MS4 flag is disabled', () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(false)
        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )
        expect(screen.getByText('TicketListView')).toBeInTheDocument()
        expect(screen.queryByText('TicketList')).not.toBeInTheDocument()
    })
})
