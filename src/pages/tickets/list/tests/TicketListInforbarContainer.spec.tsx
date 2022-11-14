import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'

import TicketListInfobarContainer from '../TicketListInfobarContainer'

jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const mockStore = configureMockStore()

describe('TicketListInfobarContainer', () => {
    const defaultState = {
        currentUser: fromJS({
            ...user,
            created_datetime: new Date().toISOString(),
        }),
    } as RootState

    it(`should log ${SegmentEvent.OnboardingWidgetClicked} event on hide link click`, () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketListInfobarContainer />
            </Provider>
        )

        fireEvent.click(getByText('Hide'))

        expect(logEventMock).toHaveBeenLastCalledWith(
            SegmentEvent.OnboardingWidgetClicked,
            {name: 'Hide'}
        )
    })
})
