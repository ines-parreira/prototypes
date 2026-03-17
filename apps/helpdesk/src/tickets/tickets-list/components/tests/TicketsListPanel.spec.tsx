import React from 'react'

import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS4Flag } from '@repo/tickets/feature-flags'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useHistory, useParams } from 'react-router-dom'

import { setViewEditMode } from 'state/views/actions'

import TicketsListPanel from '../TicketsListPanel'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
    useParams: jest.fn(),
}))
const useHistoryMock = assumeMock(useHistory)
const useParamsMock = assumeMock(useParams)

jest.mock('@repo/tickets/feature-flags', () => ({
    useHelpdeskV2MS4Flag: jest.fn(),
}))
const useHelpdeskV2MS4FlagMock = assumeMock(useHelpdeskV2MS4Flag)

jest.mock('@repo/tickets', () => ({
    useCurrentUserId: jest.fn(() => ({ currentUserId: 999 })),
}))

const mockTicketListComponent = jest.fn(
    ({
        activeTicketId,
        viewId,
        currentUserId,
        onApplyMacro,
        onFixFilters,
        onCollapse,
    }: {
        activeTicketId?: number
        viewId: number
        currentUserId: number
        onApplyMacro?: (ticketIds: number[]) => void
        onFixFilters?: () => void
        onCollapse?: () => void
    }) => (
        <div>
            <p>TicketList</p>
            <p>viewId: {viewId}</p>
            <p>activeTicketId: {activeTicketId}</p>
            <p>currentUserId: {currentUserId}</p>
            <button onClick={() => onApplyMacro?.([1, 2, 3])}>
                Open macro
            </button>
            <button onClick={onFixFilters}>Fix filters</button>
            <button onClick={onCollapse}>Collapse</button>
        </div>
    ),
)

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

jest.mock('@repo/tickets/ticket-list', () => ({
    TicketList: (props: {
        activeTicketId?: number
        viewId: number
        currentUserId: number
        onApplyMacro?: (ticketIds: number[]) => void
        onFixFilters?: () => void
        onCollapse?: () => void
    }) => mockTicketListComponent(props),
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
    default: jest.fn(),
}))
const setSplitTicketViewMock = jest.fn()
const useSplitTicketViewMock = jest.requireMock(
    'split-ticket-view-toggle/hooks/useSplitTicketView',
).default as jest.Mock

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const dispatchMock = jest.fn()
const historyPushMock = jest.fn()
const useAppDispatchMock = jest.requireMock('hooks/useAppDispatch')
    .default as jest.Mock

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

describe('TicketsListPanel', () => {
    beforeEach(() => {
        dispatchMock.mockReset()
        setSplitTicketViewMock.mockReset()
        mockTicketListComponent.mockClear()
        historyPushMock.mockReset()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useSplitTicketViewMock.mockReturnValue({
            setIsEnabled: setSplitTicketViewMock,
        })
        useHistoryMock.mockReturnValue({ push: historyPushMock } as any)
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

    it('should dispatch view edit mode, disable split ticket view and navigate when fix filters is clicked', async () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(true)
        const user = userEvent.setup()

        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )

        await user.click(screen.getByRole('button', { name: 'Fix filters' }))

        expect(dispatchMock).toHaveBeenCalledWith(setViewEditMode())
        expect(setSplitTicketViewMock).toHaveBeenCalledWith(false)
        expect(historyPushMock).toHaveBeenCalledWith('/app/tickets/123456')
    })

    it('should wire TicketList onFixFilters to edit mode, split view disable and navigation handlers', () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(true)

        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )

        const ticketListProps = mockTicketListComponent.mock.calls[0]?.[0]
        ticketListProps?.onFixFilters?.()

        expect(dispatchMock).toHaveBeenCalledWith(setViewEditMode())
        expect(setSplitTicketViewMock).toHaveBeenCalledWith(false)
        expect(historyPushMock).toHaveBeenCalledWith('/app/tickets/123456')
    })

    it('should disable split ticket view when TicketList is collapsed', () => {
        useHelpdeskV2MS4FlagMock.mockReturnValue(true)

        render(
            <Panels size={1000}>
                <TicketsListPanel />
            </Panels>,
        )

        const ticketListProps = mockTicketListComponent.mock.calls[0]?.[0]
        ticketListProps?.onCollapse?.()

        expect(setSplitTicketViewMock).toHaveBeenCalledWith(false)
    })
})
