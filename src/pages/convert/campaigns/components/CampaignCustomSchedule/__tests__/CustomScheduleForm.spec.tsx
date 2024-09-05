import React from 'react'

import {render, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CustomScheduleForm from '../CustomScheduleForm'

describe('<CustomScheduleForm />', () => {
    it('should render', () => {
        const {getByText} = render(
            <CustomScheduleForm
                onChange={jest.fn()}
                schedule={{
                    days: '1',
                    from_time: '09:00',
                    to_time: '18:00',
                }}
            />
        )

        expect(getByText('Monday')).toBeInTheDocument()
    })

    it('should call onChange with the passed data merged with the new data', () => {
        const onChangeSpy = jest.fn()

        const {getByText, container} = render(
            <CustomScheduleForm
                onChange={onChangeSpy}
                schedule={{
                    days: '1',
                    from_time: '09:00',
                    to_time: '18:00',
                }}
            />
        )

        userEvent.click(getByText('Monday'))
        userEvent.click(getByText('Tuesday'))

        expect(onChangeSpy).toHaveBeenCalledTimes(1)
        expect(onChangeSpy).toHaveBeenCalledWith({
            days: '2',
            from_time: '09:00',
            to_time: '18:00',
        })

        const fromInputEl = container.querySelector(
            'input[name="fromTime"]'
        ) as Element
        const toInputEl = container.querySelector(
            'input[name="toTime"]'
        ) as Element

        onChangeSpy.mockReset()

        fireEvent.change(fromInputEl, {target: {value: '10:00'}})

        expect(onChangeSpy).toHaveBeenCalledWith({
            days: '1', // Inital state
            from_time: '10:00',
            to_time: '18:00',
        })

        onChangeSpy.mockReset()

        fireEvent.change(toInputEl, {target: {value: '12:00'}})

        expect(onChangeSpy).toHaveBeenCalledWith({
            days: '1',
            from_time: '09:00', // Inital state
            to_time: '12:00',
        })
    })
})
