import {render, fireEvent, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {UserSettingType} from 'config/types/user'
import {DateFormatType, TimeFormatType} from 'constants/datetime'

import TicketSnooze from '../TicketSnooze'

const mockStore = configureMockStore([thunk])

describe('<TicketSnooze/>', () => {
    const store = mockStore({
        currentUser: fromJS({
            id: 1,
            email: 'steve@acme.gorgias.io',
            settings: [
                {
                    data: {
                        date_format: DateFormatType.en_GB,
                        time_format: TimeFormatType.AmPm,
                    },
                    id: 21,
                    type: UserSettingType.Preferences,
                },
            ],
        }),
    })

    describe('rendering', () => {
        it('should render null if no datetime is provided', () => {
            const {queryByText} = render(
                <Provider store={store}>
                    <TicketSnooze timezone="utc" />
                </Provider>
            )
            expect(queryByText('Snoozed')).not.toBeInTheDocument()
        })

        it('should render a badge with a tooltip', async () => {
            const {getByText} = render(
                <Provider store={store}>
                    <TicketSnooze datetime="2017-12-22 17:00" timezone="utc" />
                </Provider>
            )
            const el = getByText('Snoozed')
            expect(el).toBeInTheDocument()

            fireEvent.mouseOver(el)
            await waitFor(() => getByText(/2017/))

            expect(getByText(/Snoozed until 22\/12\/2017/)).toBeInTheDocument()
        })
    })
})
