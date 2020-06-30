import React from 'react'
import {fromJS} from 'immutable'
import {mount, shallow} from 'enzyme'
import {noop as _noop} from 'lodash/noop'

import BusinessHoursForm from '../BusinessHoursForm'

describe('BusinessHoursForm component', () => {
    it('should render', () => {
        const component = shallow(
            <BusinessHoursForm
                onChange={_noop}
                businessHour={fromJS({
                    days: '1',
                    from_time: '09:00',
                    to_time: '18:00',
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should call props.onChange with the passed data merged with the new data', () => {
        const spy = jest.fn()

        const component = mount(
            <BusinessHoursForm
                onChange={spy}
                businessHour={fromJS({
                    days: '1',
                    from_time: '09:00',
                    to_time: '18:00',
                })}
            />
        ).instance()

        component._onChange({days: '2'})

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(
            fromJS({
                days: '2',
                from_time: '09:00',
                to_time: '18:00',
            })
        )
    })
})
