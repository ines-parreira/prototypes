import React from 'react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BusinessHoursForm from '../BusinessHoursForm'

describe('<BusinessHoursForm />', () => {
    it('should render', () => {
        const {container} = render(
            <BusinessHoursForm
                onChange={_noop}
                businessHour={fromJS({
                    days: '1',
                    from_time: '09:00',
                    to_time: '18:00',
                })}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onChange with the passed data merged with the new data', () => {
        const spy = jest.fn()

        const {getByText} = render(
            <BusinessHoursForm
                onChange={spy}
                businessHour={fromJS({
                    days: '1',
                    from_time: '09:00',
                    to_time: '18:00',
                })}
            />
        )

        userEvent.click(getByText('Monday'))
        userEvent.click(getByText('Tuesday'))

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
