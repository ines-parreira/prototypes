import React from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import moment from 'moment'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import ActionEventsHeader from '../ActionEventsHeader'

const mockStore = configureMockStore([thunk])

describe('<ActionEventsHeader />', () => {
    it('should render component', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const storeState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: periodEnd.toISOString(),
                        start_datetime: periodStart.toISOString(),
                    },
                },
            },
        } as RootState

        renderWithRouter(
            <Provider store={mockStore(storeState)}>
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />
            </Provider>
        )

        expect(
            screen.getByText(
                'View all events when this Action has been performe',
                {exact: false}
            )
        ).toBeInTheDocument()
    })
})
