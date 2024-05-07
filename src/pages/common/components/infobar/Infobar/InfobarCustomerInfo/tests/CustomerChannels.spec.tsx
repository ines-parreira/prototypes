import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    EMAIL_CUSTOMER_CHANNEL_TYPE,
    PHONE_CUSTOMER_CHANNEL_TYPE,
} from 'constants/user'
import {initialState} from 'state/twilio/reducers'
import {UserSettingType} from 'config/types/user'
import {
    DateFormatType,
    DateTimeFormatMapper,
    DateTimeFormatType,
    TimeFormatType,
} from 'constants/datetime'
import {CustomerChannel} from 'models/customerChannel/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {CustomerChannels} from '../CustomerChannels'

jest.mock(
    'pages/common/components/ClickablePhoneNumber/ClickablePhoneNumber',
    () =>
        ({address}: {address: string}) =>
            <div>{address}</div>
)
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/NewPhoneNumber',
    () => () => <div>Add phone number</div>
)

const mockStore = configureMockStore([thunk])

const minProps: ComponentProps<typeof CustomerChannels> = {
    customerName: 'Foo',
    customerId: '1',
    channels: fromJS([]),
    customerLocationInfo: fromJS({}),
    customerLastSeenOnChat: null,
    flags: {
        [FeatureFlagKey.NewPhoneNumberCustomerSidebar]: true,
    },
    datetimeFormat:
        DateTimeFormatMapper[DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_24HOUR],
    dispatch: jest.fn(),
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

            renderWithQueryClientProvider(
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
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 1 passed ' +
            'channel + add phone number button',
        () => {
            const {queryByText} = renderWithQueryClientProvider(
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

            expect(queryByText(/Show more/)).toBeNull()
        }
    )

    it(
        `should display all passed channels and not display the button "show more" because there is only 2 passed ` +
            `location channel and and add phone number button`,
        () => {
            const {getByText, queryByText} = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                        })}
                    />
                </Provider>
            )
            ;(minProps.channels.toJS() as CustomerChannel[]).forEach(
                (channel) => {
                    expect(getByText(channel.address)).toBeInTheDocument()
                }
            )
            expect(queryByText(/Show more/)).toBeNull()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 2 passed ' +
            'location channel and add phone number button',
        () => {
            const {getByText, queryByText} = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                        })}
                    />
                </Provider>
            )

            ;(minProps.channels.toJS() as CustomerChannel[]).forEach(
                (channel) => {
                    expect(getByText(channel.address)).toBeInTheDocument()
                }
            )
            expect(queryByText(/Show more/)).toBeNull()
        }
    )

    it(
        'should display the email channel and the local time channel and then display the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const channels = [
                {
                    type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                    address: 'foo@gorgias.io',
                    preferred: true,
                },
            ]

            const {getByText} = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                            time_zone: {offset: '+0100'},
                        })}
                        channels={fromJS(channels)}
                    />
                </Provider>
            )

            userEvent.click(getByText(/Show more/))
            channels.forEach((channel) => {
                expect(getByText(channel.address)).toBeInTheDocument()
            })
            expect(getByText(/Location: Paris, France/)).toBeInTheDocument()
            expect(getByText(/Local time:/)).toBeInTheDocument()
        }
    )

    it(
        'should display the email channel and the local time channel and then display the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const channels = [
                {
                    type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                    address: 'foo@gorgias.io',
                    preferred: true,
                },
            ]

            const {getByText} = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            country_name: 'France',
                            time_zone: {offset: '+0100'},
                        })}
                        channels={fromJS(channels)}
                    />
                </Provider>
            )

            userEvent.click(getByText(/Show more/))
            channels.forEach((channel) => {
                expect(getByText(channel.address)).toBeInTheDocument()
            })
            expect(getByText(/Location: France/)).toBeInTheDocument()
            expect(getByText(/Local time:/)).toBeInTheDocument()
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

        const channels = [
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
        ]

        const {getByText} = renderWithQueryClientProvider(
            <Provider store={store}>
                <CustomerChannels
                    {...minProps}
                    customerLastSeenOnChat={1614342240000} // 2021-02-26T12:24:00.000Z
                    customerLocationInfo={fromJS({
                        city: 'Paris',
                        country_name: 'France',
                        time_zone: {offset: '+0100'},
                    })}
                    channels={fromJS(channels)}
                />
            </Provider>
        )

        userEvent.click(getByText(/Show more/))
        channels.forEach((channel) => {
            expect(getByText(channel.address)).toBeInTheDocument()
        })
        expect(getByText(/Location: Paris, France/)).toBeInTheDocument()
        expect(getByText(/Local time:/)).toBeInTheDocument()
    })

    it('should display "Add phone number button when there are no phone channels', async () => {
        const {getByText} = renderWithQueryClientProvider(
            <Provider store={mockStore(defaultState)}>
                <CustomerChannels
                    {...minProps}
                    channels={fromJS([
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            address: 'baz@gorgias.io',
                            preferred: false,
                            id: 3,
                        },
                    ])}
                />
            </Provider>
        )
        await waitFor(() => expect(getByText(/Add phone number/)).toBeVisible())
    })

    it('should not display "Add phone number button when there is a phone channel', () => {
        const store = mockStore({
            ...defaultState,
            twilio: initialState,
            integrations: fromJS({
                integrations: [],
            }),
        })

        const {queryByText} = renderWithQueryClientProvider(
            <Provider store={mockStore(store)}>
                <CustomerChannels
                    {...minProps}
                    channels={fromJS([
                        {
                            type: PHONE_CUSTOMER_CHANNEL_TYPE,
                            address: '+15551238523',
                            preferred: true,
                            id: 4,
                        },
                    ])}
                />
            </Provider>
        )

        expect(queryByText(/Add phone number/)).toBeNull()
    })

    it('should not display "Add phone number button when the FF is off', () => {
        const store = mockStore({
            ...defaultState,
            twilio: initialState,
            integrations: fromJS({
                integrations: [],
            }),
        })

        const {queryByText} = renderWithQueryClientProvider(
            <Provider store={mockStore(store)}>
                <CustomerChannels
                    {...minProps}
                    flags={
                        {
                            [FeatureFlagKey.NewPhoneNumberCustomerSidebar]:
                                false,
                        } as any
                    }
                />
            </Provider>
        )

        expect(queryByText(/Add phone number/)).toBeNull()
    })
})
