import React, { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { clone } from 'lodash'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as segmentTracker from 'common/segment'
import { UserRole, UserSettingType } from 'config/types/user'
import { DateFormatType, TimeFormatType } from 'constants/datetime'
import {
    EMAIL_CUSTOMER_CHANNEL_TYPE,
    PHONE_CUSTOMER_CHANNEL_TYPE,
} from 'constants/user'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { customerFieldDefinitions } from 'fixtures/customField'
import { CustomerChannel } from 'models/customerChannel/types'
import { initialState } from 'state/twilio/voiceDevice'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { assumeMock } from '../../../../../../../utils/testing'
import { CustomerChannels } from '../CustomerChannels'

jest.mock(
    'pages/common/components/ClickablePhoneNumber/ClickablePhoneNumber',
    () =>
        ({ address }: { address: string }) => <div>{address}</div>,
)
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/NewPhoneNumber',
    () => () => <div>Add phone number</div>,
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

const mockedUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)
const logEventSpy = jest.spyOn(segmentTracker, 'logEvent')
const { SegmentEvent } = segmentTracker

const mockStore = configureMockStore([thunk])

const minProps: ComponentProps<typeof CustomerChannels> = {
    customerName: 'Foo',
    customerId: '1',
    channels: fromJS([]),
    customerLocationInfo: fromJS({}),
    customerLastSeenOnChat: null,
}

const defaultUser = {
    id: 1,
    email: 'steve@acme.gorgias.io',
    role: { name: UserRole.Agent },
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
}
const defaultState = {
    currentUser: fromJS(defaultUser),
}

describe('CustomerChannels component', () => {
    beforeEach(() => {
        const mockDate = new Date('2019-01-26T12:34:56.000Z')
        global.Date.now = jest.fn(() => mockDate) as unknown as typeof Date.now
        mockedUseCustomFieldDefinitions.mockReturnValue({
            data: { data: customerFieldDefinitions },
        } as any)
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
                            time_zone: { offset: '+0100' },
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
                </Provider>,
            )

            userEvent.click(screen.getByText(/Show more/))
        },
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 1 passed ' +
            'channel + add phone number button',
        () => {
            const { queryByText } = renderWithQueryClientProvider(
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
                </Provider>,
            )

            expect(queryByText(/Show more/)).toBeNull()
        },
    )

    it('should not display the button "show more" because all channels are invalid', () => {
        renderWithQueryClientProvider(
            <Provider store={mockStore(defaultState)}>
                <CustomerChannels
                    {...minProps}
                    channels={fromJS([
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            preferred: true,
                        },
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            preferred: false,
                        },
                        {
                            type: PHONE_CUSTOMER_CHANNEL_TYPE,
                            address: '',
                            preferred: false,
                        },
                    ])}
                />
            </Provider>,
        )

        expect(screen.queryByText(/Show more/)).toBeNull()
    })

    it('should also display channels others than phone and email', () => {
        renderWithQueryClientProvider(
            <Provider store={mockStore(defaultState)}>
                <CustomerChannels
                    {...minProps}
                    channels={fromJS([
                        {
                            type: 'aircall',
                            address: 'AircallHandle',
                            preferred: false,
                        },
                        {
                            type: 'twilio',
                            address: 'TwilioHandle',
                            preferred: false,
                        },
                    ])}
                />
            </Provider>,
        )

        userEvent.click(screen.getByText(/Show more/))

        expect(screen.getByText('AircallHandle')).toBeInTheDocument()
        expect(screen.getByText('TwilioHandle')).toBeInTheDocument()
    })

    it(
        `should display all passed channels and not display the button "show more" because there is only 2 passed ` +
            `location channel and and add phone number button`,
        () => {
            const { getByText, queryByText } = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                        })}
                    />
                </Provider>,
            )
            ;(minProps.channels.toJS() as CustomerChannel[]).forEach(
                (channel) => {
                    expect(getByText(channel.address)).toBeInTheDocument()
                },
            )
            expect(queryByText(/Show more/)).toBeNull()
        },
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 2 passed ' +
            'location channel and add phone number button',
        () => {
            const { getByText, queryByText } = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                        })}
                    />
                </Provider>,
            )

            ;(minProps.channels.toJS() as CustomerChannel[]).forEach(
                (channel) => {
                    expect(getByText(channel.address)).toBeInTheDocument()
                },
            )
            expect(queryByText(/Show more/)).toBeNull()
        },
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

            const { getByText } = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            city: 'Paris',
                            country_name: 'France',
                            time_zone: { offset: '+0100' },
                        })}
                        channels={fromJS(channels)}
                    />
                </Provider>,
            )

            userEvent.click(getByText(/Show more/))
            channels.forEach((channel) => {
                expect(getByText(channel.address)).toBeInTheDocument()
            })
            expect(getByText(/Location: Paris, France/)).toBeInTheDocument()
            expect(getByText(/Local time:/)).toBeInTheDocument()
        },
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

            const { getByText } = renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels
                        {...minProps}
                        customerLocationInfo={fromJS({
                            country_name: 'France',
                            time_zone: { offset: '+0100' },
                        })}
                        channels={fromJS(channels)}
                    />
                </Provider>,
            )

            userEvent.click(getByText(/Show more/))
            channels.forEach((channel) => {
                expect(getByText(channel.address)).toBeInTheDocument()
            })
            expect(getByText(/Location: France/)).toBeInTheDocument()
            expect(getByText(/Local time:/)).toBeInTheDocument()
        },
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

        const { getByText } = renderWithQueryClientProvider(
            <Provider store={store}>
                <CustomerChannels
                    {...minProps}
                    customerLastSeenOnChat={1614342240000} // 2021-02-26T12:24:00.000Z
                    customerLocationInfo={fromJS({
                        city: 'Paris',
                        country_name: 'France',
                        time_zone: { offset: '+0100' },
                    })}
                    channels={fromJS(channels)}
                />
            </Provider>,
        )

        userEvent.click(getByText(/Show more/))
        channels.forEach((channel) => {
            expect(getByText(channel.address)).toBeInTheDocument()
        })
        expect(getByText(/Location: Paris, France/)).toBeInTheDocument()
        expect(getByText(/Local time:/)).toBeInTheDocument()
    })

    it('should display "Add phone number button', async () => {
        const { getByText } = renderWithQueryClientProvider(
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
            </Provider>,
        )
        await waitFor(() => expect(getByText(/Add phone number/)).toBeVisible())
    })

    describe('Customer Fields', () => {
        beforeEach(() => {
            const mockDate = new Date('2019-01-26T12:34:56.000Z')
            global.Date.now = jest.fn(
                () => mockDate,
            ) as unknown as typeof Date.now
            mockedUseCustomFieldDefinitions.mockReturnValue({
                data: { data: [] },
            } as any)
        })
        it('should show an empty custom fields indicator at the bottom of the channels list', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(defaultState)}>
                    <CustomerChannels {...minProps} />
                </Provider>,
            )

            expect(screen.getByText('Customer Fields')).toBeInTheDocument()
        })

        it('should show a link to admins at the bottom of the channels list', () => {
            const adminUser = clone(defaultUser)
            adminUser.role.name = UserRole.Admin
            const adminState = { currentUser: fromJS(adminUser) }

            renderWithQueryClientProvider(
                <Provider store={mockStore(adminState)}>
                    <CustomerChannels {...minProps} />
                </Provider>,
            )

            expect(screen.getByText('Add Customer Fields')).toBeInTheDocument()

            fireEvent.click(screen.getByText('Add Customer Fields'))
            expect(logEventSpy).toHaveBeenCalledWith(
                SegmentEvent.CustomFieldCustomerAddFieldsClicked,
            )
        })
    })
})
