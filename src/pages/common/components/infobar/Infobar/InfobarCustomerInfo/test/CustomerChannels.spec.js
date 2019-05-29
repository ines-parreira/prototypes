import React from 'react'
import {fromJS} from 'immutable'
import {mount, shallow} from 'enzyme'

import {EMAIL_CUSTOMER_CHANNEL_TYPE, PHONE_CUSTOMER_CHANNEL_TYPE} from '../../../../../../../constants/user'
import CustomerChannels from '../CustomerChannels'


describe('CustomerChannels component', () => {
    it('should display first few passed channels and the button "show more" because there are more channels than ' +
        'those displayed', () => {
        const component = shallow(
            <CustomerChannels
                channels={fromJS([
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'foo@gorgias.io', preferred: true},
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'bar@gorgias.io', preferred: false},
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'baz@gorgias.io', preferred: false},
                    {type: PHONE_CUSTOMER_CHANNEL_TYPE, address: '+15551238523', preferred: true},
                    {type: PHONE_CUSTOMER_CHANNEL_TYPE, address: '+15554567852', preferred: false},
                    {type: PHONE_CUSTOMER_CHANNEL_TYPE, address: '+15557899632', preferred: false},
                ])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display all passed channels and not display the button "show more" because there is only 1 passed ' +
        'channel', () => {
        const component = shallow(
            <CustomerChannels
                channels={fromJS([
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'foo@gorgias.io', preferred: true}
                ])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display all passed channels because the user clicked on "show more"', () => {
        const component = mount(
            <CustomerChannels
                channels={fromJS([
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'foo@gorgias.io', preferred: true},
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'bar@gorgias.io', preferred: false},
                    {type: EMAIL_CUSTOMER_CHANNEL_TYPE, address: 'baz@gorgias.io', preferred: false},
                    {type: PHONE_CUSTOMER_CHANNEL_TYPE, address: '+15551238523', preferred: true},
                    {type: PHONE_CUSTOMER_CHANNEL_TYPE, address: '+15554567852', preferred: false},
                    {type: PHONE_CUSTOMER_CHANNEL_TYPE, address: '+15557899632', preferred: false},
                ])}
            />, {
                // required for `reactstrap.Tooltip` to mount correctly
                // see https://github.com/reactstrap/reactstrap/issues/818
                attachTo: document.body
            })

        expect(component.children()).toMatchSnapshot()

        component.find('button.show-more').simulate('click')

        expect(component.children()).toMatchSnapshot()

        // cleanup after using `attachTo`
        // see https://github.com/airbnb/enzyme/blob/master/docs/api/ReactWrapper/detach.md
        component.detach()
    })
})
