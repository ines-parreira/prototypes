import React from 'react'
import {fromJS} from 'immutable'
import {mount, shallow} from 'enzyme'

import {
    EMAIL_CUSTOMER_CHANNEL_TYPE,
    PHONE_CUSTOMER_CHANNEL_TYPE,
} from '../../../../../../../constants/user.ts'
import {CustomerChannels as CustomerChannelsComponent} from '../CustomerChannels.tsx'

describe('CustomerChannels component', () => {
    beforeEach(() => {
        const mockDate = new Date('2019-01-26T12:34:56.000Z')
        global.Date.now = jest.fn(() => mockDate)
    })

    it(
        'should display first few passed channels and the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const component = shallow(
                <CustomerChannelsComponent
                    currentUser={fromJS({
                        timezone: 'Europe/Paris',
                    })}
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
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 1 passed ' +
            'channel',
        () => {
            const component = shallow(
                <CustomerChannelsComponent
                    currentUser={fromJS({
                        timezone: 'Europe/Paris',
                    })}
                    channels={fromJS([
                        {
                            type: EMAIL_CUSTOMER_CHANNEL_TYPE,
                            address: 'foo@gorgias.io',
                            preferred: true,
                        },
                    ])}
                />
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 2 passed ' +
            'location channel and local time channel',
        () => {
            const component = shallow(
                <CustomerChannelsComponent
                    currentUser={fromJS({
                        timezone: 'Europe/Paris',
                    })}
                    customerLocationInfo={fromJS({
                        city: 'Paris',
                        country_name: 'France',
                        time_zone: {offset: '+0100'},
                    })}
                    channels={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should display all passed channels and not display the button "show more" because there is only 2 passed ' +
            'location channel and local time channel',
        () => {
            const component = shallow(
                <CustomerChannelsComponent
                    currentUser={fromJS({
                        timezone: 'Europe/Paris',
                    })}
                    customerLocationInfo={fromJS({
                        city: 'Paris',
                        time_zone: {offset: '+0100'},
                    })}
                    channels={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should display the email channel and the local time channel and then display the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const component = shallow(
                <CustomerChannelsComponent
                    currentUser={fromJS({
                        timezone: 'Europe/Paris',
                    })}
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
            )

            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should display the email channel and the local time channel and then display the button "show more" because there are more channels than ' +
            'those displayed',
        () => {
            const component = shallow(
                <CustomerChannelsComponent
                    currentUser={fromJS({
                        timezone: 'Europe/Paris',
                    })}
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
            )

            expect(component).toMatchSnapshot()
        }
    )

    it('should display all passed channels (including last seen on chat 36 minutes ago) because the user clicked on "show more"', () => {
        const mockDate = new Date('2021-02-26T13:00:00.000Z')
        global.Date.now = jest.fn(() => mockDate)

        const component = mount(
            <CustomerChannelsComponent
                currentUser={fromJS({
                    timezone: 'Europe/Paris',
                })}
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
            />,
            {
                // required for `reactstrap.Tooltip` to mount correctly
                // see https://github.com/reactstrap/reactstrap/issues/818
                attachTo: document.body,
            }
        )

        expect(component.children()).toMatchSnapshot()

        component.find('button').simulate('click')

        expect(component.children()).toMatchSnapshot()

        // cleanup after using `attachTo`
        // see https://github.com/airbnb/enzyme/blob/master/docs/api/ReactWrapper/detach.md
        component.detach()
    })
})
