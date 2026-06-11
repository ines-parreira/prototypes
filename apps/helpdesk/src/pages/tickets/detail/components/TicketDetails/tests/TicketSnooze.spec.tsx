import React from 'react'

import { render } from '@repo/testing'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { act, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UserSettingType } from 'config/types/user'

import { TicketSnooze } from '../TicketSnooze'

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
            const { queryByText } = render(
                <Provider store={store}>
                    <TicketSnooze timezone="utc" />
                </Provider>,
            )
            expect(queryByText('Snoozed')).not.toBeInTheDocument()
        })

        it('should render a badge with a tooltip', async () => {
            render(
                <Provider store={store}>
                    <TicketSnooze datetime="2017-12-22 17:00" timezone="utc" />
                </Provider>,
            )

            const badge = screen.getByText('Snoozed')
            const trigger = badge.closest(
                '[data-name="tooltip-trigger"]',
            ) as HTMLElement

            expect(badge).toBeInTheDocument()

            act(() => {
                trigger.focus()
            })

            expect(await screen.findByRole('tooltip')).toHaveTextContent(
                'Snoozed until 22/12/2017',
            )
        })

        it('should render the standalone tooltip message when disabled', async () => {
            render(
                <Provider store={store}>
                    <TicketSnooze
                        datetime="2017-12-22 17:00"
                        timezone="utc"
                        disabled
                    />
                </Provider>,
            )

            const badge = screen.getByText('Snoozed')
            const trigger = badge.closest(
                '[data-name="tooltip-trigger"]',
            ) as HTMLElement

            act(() => {
                trigger.focus()
            })

            expect(
                await screen.findByText('Not available in standalone mode'),
            ).toBeInTheDocument()
        })
    })
})
