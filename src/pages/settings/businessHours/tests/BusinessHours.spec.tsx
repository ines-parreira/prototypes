import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import BusinessHours, {BusinessHoursContainer} from '../BusinessHours'
import {SETTING_TYPE_BUSINESS_HOURS} from '../../../../state/currentAccount/constants'

const mockStore = configureMockStore([thunk])

describe('BusinessHours component', () => {
    it('should render default values', () => {
        const mockSubmitSetting = jest.fn()
        const component = shallow(
            <BusinessHoursContainer
                submitSetting={mockSubmitSetting}
                businessHoursSettings={fromJS({})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render values from state', () => {
        const component = mount(
            <Provider
                store={mockStore({
                    currentAccount: fromJS({
                        settings: [
                            {
                                type: SETTING_TYPE_BUSINESS_HOURS,
                                data: {
                                    business_hours: [
                                        {
                                            days: '2',
                                            from_time: '10:00',
                                            to_time: '17:00',
                                        },
                                        {
                                            days: '4',
                                            from_time: '11:00',
                                            to_time: '17:00',
                                        },
                                    ],
                                    timezone: 'US/Pacific',
                                },
                            },
                        ],
                    }),
                })}
            >
                <BusinessHours />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })
})
