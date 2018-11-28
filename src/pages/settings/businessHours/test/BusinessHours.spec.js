import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {noop as _noop} from 'lodash/noop'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import BusinessHours from '../BusinessHours'
import {SETTING_TYPE_BUSINESS_HOURS} from '../../../../state/currentAccount/constants'

const mockStore = configureMockStore([thunk])


describe('BusinessHours component', () => {
    let store = mockStore({})

    it('should render default values', () => {
        const component = shallow(
            <BusinessHours
                store={store}
                submitSetting={_noop}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render values from state', () => {
        const component = mount(
            <BusinessHours
                store={mockStore({
                    currentAccount: fromJS({
                        settings: [{
                            type: SETTING_TYPE_BUSINESS_HOURS,
                            data: {
                                business_hours: [
                                    {days: '2', from_time: '10:00', to_time: '17:00'},
                                    {days: '4', from_time: '11:00', to_time: '17:00'},
                                ],
                                timezone: 'US/Pacific'
                            }
                        }]
                    })
                })}
                submitSetting={_noop}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
