import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import StatCurrentDate from '../StatCurrentDate'
import {RootState, StoreDispatch} from '../../../../../state/types'

jest.mock('moment-timezone', () => {
    const moment: ((
        date?: string,
        format?: string
    ) => Record<string, unknown>) & {utc: () => unknown} = jest.requireActual(
        'moment-timezone'
    )
    const fn = (...args: any[]) =>
        args.length > 0 ? moment(...args) : moment('2019-09-03')
    fn.utc = moment.utc

    return fn
})

describe('<StatCurrentDate />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            settings: [
                {
                    data: {
                        business_hours: [
                            {
                                days: '0,1,2,3,4,5,6',
                                from_time: '9:00',
                                to_time: '11:00',
                            },
                            {
                                days: '0,1,2,3,4,5,6',
                                from_time: '14:00',
                                to_time: '16:00',
                            },
                            {
                                days: '0,1,2,3,4,5,6',
                                from_time: '8:00',
                                to_time: '12:00',
                            },
                            {
                                days: '0,1,2,3,4,5,6',
                                from_time: '13:00',
                                to_time: '17:30',
                            },
                        ],
                        timezone: 'US/Pacific',
                    },
                    id: 2,
                    type: 'business-hours',
                },
            ],
        }),
        currentUser: fromJS({
            timezone: 'US/Pacific',
        }),
    }

    it('should display the current date with business hours', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <StatCurrentDate />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the current date without business hours', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.set(
                        'settings',
                        fromJS([])
                    ),
                })}
            >
                <StatCurrentDate />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
