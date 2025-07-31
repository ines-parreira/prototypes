import type { ReactNode } from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { StaticRouter } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { closePanels } from 'state/layout/actions'
import { activeViewIdSet } from 'state/ui/views/actions'
import { setViewActive } from 'state/views/actions'
import { assumeMock } from 'utils/testing'

import { RecentChats } from '../RecentChats'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment'),
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
