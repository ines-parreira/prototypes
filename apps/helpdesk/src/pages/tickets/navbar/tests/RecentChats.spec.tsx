import type { ReactNode } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { StaticRouter } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { closePanels } from 'state/layout/actions'
import { activeViewIdSet } from 'state/ui/views/actions'
import { setViewActive } from 'state/views/actions'

import { RecentChats } from '../RecentChats'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(() => false),
}))
const useHelpdeskV2WayfindingMS1FlagMock = jest.requireMock(
    '@repo/feature-flags',
).useHelpdeskV2WayfindingMS1Flag as jest.Mock

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
        }) as typeof import('@repo/logging'),
)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('state/layout/actions', () => ({ closePanels: jest.fn() }))
const closePanelsMock = assumeMock(closePanels)

jest.mock('state/ui/views/actions', () => ({ activeViewIdSet: jest.fn() }))
const activeViewIdSetMock = assumeMock(activeViewIdSet)

jest.mock('state/views/actions', () => ({ setViewActive: jest.fn() }))
const setViewActiveMock = assumeMock(setViewActive)

const recentTicket = {
    channel: 'email',
    id: 1,
    is_unread: true,
    customer: { id: 1, email: 'john.doe@example.com', name: 'John Doe' },
}

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app">{children}</StaticRouter>
)

describe('RecentChats', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue(fromJS({ tickets: [recentTicket] }))

        activeViewIdSetMock.mockReturnValue({
            type: 'active-view-id-set',
            payload: 0,
        })
        closePanelsMock.mockReturnValue({ type: 'close-panels' })
        setViewActiveMock.mockReturnValue(dispatch)
    })

    describe('with wayfinding flag disabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('should log an event and dispatch some actions on click', () => {
            render(<RecentChats />, { wrapper })
            userEvent.click(screen.getByText('John Doe'))
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.RecentActivityClicked,
                {
                    position: 1,
                    ticket: recentTicket,
                },
            )
            expect(dispatch).toHaveBeenCalledWith({ type: 'close-panels' })
            expect(dispatch).toHaveBeenCalledWith(dispatch)
            expect(dispatch).toHaveBeenCalledWith({
                type: 'active-view-id-set',
                payload: 0,
            })
        })
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render the "Real-time" section header', () => {
            render(<RecentChats />, { wrapper })

            expect(screen.getByText('Real-time')).toBeInTheDocument()
        })

        it('should render customer names after expanding the section', async () => {
            const user = userEvent.setup()
            render(<RecentChats />, { wrapper })

            await user.click(screen.getByText('Real-time'))

            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })

        it('should not render anything when there are no tickets', () => {
            useAppSelectorMock.mockReturnValue(fromJS({ tickets: [] }))
            const { container } = render(<RecentChats />, { wrapper })

            expect(container).toBeEmptyDOMElement()
        })

        it('should log a segment event when a ticket item is clicked', async () => {
            const user = userEvent.setup()
            render(<RecentChats />, { wrapper })

            await user.click(screen.getByText('Real-time'))
            await user.click(screen.getByText('John Doe'))

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.RecentActivityClicked,
                {
                    position: 1,
                    ticket: recentTicket,
                },
            )
            expect(dispatch).not.toHaveBeenCalled()
        })
    })
})
