import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import history from 'pages/history'
import { RootState, StoreDispatch } from 'state/types'

import TimelineTicket from '../TimelineTicket'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        CustomerTimelineTicketClicked: 'CustomerTimelineTicketClicked',
    },
}))

jest.mock('pages/history')
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

describe('TimelineTicket', () => {
    const ticket = Map({
        id: 1,
        subject: 'Test Subject',
        messages_count: 2,
        status: 'open',
        assignee_user: { name: 'John Doe' },
        excerpt: 'Test Excerpt',
        created_datetime: '2021-01-01T00:00:00Z',
        channel: 'email',
    })

    it('navigates to a ticket when it is clicked', () => {
        const { getByRole } = render(
            <Router history={history}>
                <Provider store={mockStore()}>
                    <TimelineTicket isCurrent={false} ticket={ticket} />
                </Provider>
            </Router>,
        )

        fireEvent.click(getByRole('link'))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineTicketClicked,
        )

        expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
    })
})
