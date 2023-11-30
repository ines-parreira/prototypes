import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    EMAIL_CUSTOMER_CHANNEL_TYPE,
    PHONE_CUSTOMER_CHANNEL_TYPE,
} from 'constants/user'
import {initialState} from 'state/twilio/reducers'
import {UserSettingType} from 'config/types/user'
import {DateFormatType, TimeFormatType} from 'constants/datetime'
import CustomerChannels from '../CustomerChannels'

const mockStore = configureMockStore([thunk])

const minProps: ComponentProps<typeof CustomerChannels> = {
    customerName: 'Foo',
    customerId: '1',
    channels: fromJS([]),
    customerLocationInfo: fromJS({}),
    customerLastSeenOnChat: null,
}

const defaultState = {
    currentUser: fromJS({
        id: 1,
        email: 'steve@acme.gorgias.io',
        settings: [
            {
                data: {
                    date_format: DateFormatType.en_GB,
                    time_format: TimeFormatType.TwentyFourHour,
                },
                id: 21,
                type: UserSettingType.Preferences,
            },
        ],
    }),
}
describe('CustomerChannels component', () => {
    beforeEach(() => {
        const mockDate = new Date('2019-01-26T12:34:56.000Z')
        global.Date.now = jest.fn(() => mockDate) as unknown as typeof Date.now
    })

    it(
        'should display first few passed channels and the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const store = mockStore({
                ...defaultState,
                integrations: fromJS({
                    integrations: [],
                }),
            })

            const {container} = render(
                <Provider store={store}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                            time_zone: {offset: '+0100'},
                        })}
                        channels={fromJS([
                            {
                                type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                                address: 'foo@gorgias.io',
                                preferred: true,
                            },
                            {
                                type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                                address: 'bar@gorgias.io',
                                preferred: false,
                            },
                            {
                                type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                                address: 'baz@gorgias.io',
                                preferred: false,
                            },
                            {
                                type: PHONE_CUSTOMER_CHANNEL_TYPE,
                                address: '+15551238523',
                                preferred: true,
                            },
                            {
                                type: PHONE_CUSTOMER_CHANNEL_TYPE,
                                address: '+15554567852',
                                preferred: false,
                            },
                            {
                                type: PHONE_CUSTOMER_CHANNEL_TYPE,
                                address: '+15557899632',
                                preferred: false,
                            },
                        ])}
                    />
                </Provider>
            )

            userEvent.click(screen.getByText(/Show more/))
            expect(container).toMatchSnapshot()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 1 passed ' +
            'channel',
        () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        channels={fromJS([
                            {
                                type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                                address: 'foo@gorgias.io',
                                preferred: true,
                            },
                        ])}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 2 passed ' +
            'location channel and local time channel',
        () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                            time_zone: {offset: '+0100'},
                        })}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 2 passed ' +
            'location channel and local time channel',
        () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            time_zone: {offset: '+0100'},
                        })}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        }
    )

    it(
        'should display the email channel and the local time channel and then display the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                            time_zone: {offset: '+0100'},
                        })}
                        channels={fromJS([
                            {
                                type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                                address: 'foo@gorgias.io',
                                preferred: true,
                            },
                        ])}
                    />
                </Provider>
            )

            userEvent.click(screen.getByText(/Show more/))
            expect(container).toMatchSnapshot()
        }
    )

    it(
        'should display the email channel and the local time channel and then display the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            country_name: 'France',
                            time_zone: {offset: '+0100'},
                        })}
                        channels={fromJS([
                            {
                                type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                                address: 'foo@gorgias.io',
                                preferred: true,
                            },
                        ])}
                    />
                </Provider>
            )

            userEvent.click(screen.getByText(/Show more/))
            expect(container).toMatchSnapshot()
        }
    )

    it('should display all passed channels (including last seen on chat 36 minutes ago) because the user clicked on "show more"', () => {
        const mockDate = new Date('2021-02-26T13:00:00.000Z')
        global.Date.now = jest.fn(() => mockDate) as unknown as typeof Date.now

        const store = mockStore({
            ...defaultState,
            twilio: initialState,
            integrations: fromJS({
                integrations: [],
            }),
        })

        const {container} = render(
            <Provider store={store}>
                <CustomerChannels
                    {...minProps}
                    customerLastSeenOnChat={1614342240000} // 2021-02-26T12:24:00.000Z
                    customerLocationInfo={fromJS({
                        city: 'Paris',
                        country_name: 'France',
                        time_zone: {offset: '+0100'},
                    })}
                    channels={fromJS([
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            address: 'foo@gorgias.io',
                            preferred: true,
                            id: 1,
                        },
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            address: 'bar@gorgias.io',
                            preferred: false,
                            id: 2,
                        },
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            address: 'baz@gorgias.io',
                            preferred: false,
                            id: 3,
                        },
                        {
                            type: PHONE_CUSTOMER_CHANNEL_TYPE,
                            address: '+15551238523',
                            preferred: true,
                            id: 4,
                        },
                        {
                            type: PHONE_CUSTOMER_CHANNEL_TYPE,
                            address: '+15554567852',
                            preferred: false,
                            id: 5,
                        },
                        {
                            type: PHONE_CUSTOMER_CHANNEL_TYPE,
                            address: '+15557899632',
                            preferred: false,
                            id: 6,
                        },
                    ])}
                />
            </Provider>
        )

        userEvent.click(screen.getByText(/Show more/))
        expect(container).toMatchSnapshot()
    })
})
