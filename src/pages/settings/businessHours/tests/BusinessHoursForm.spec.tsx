import { act, fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import BusinessHoursForm from '../BusinessHoursForm'
import { DEPRECATED_DAYS_OPTIONS } from '../constants'

describe('<BusinessHoursForm />', () => {
    const mondayOption = DEPRECATED_DAYS_OPTIONS.find(
        ({ label }) => label === 'Monday',
    )

    it('should render', () => {
        render(
            <BusinessHoursForm
                onChange={jest.fn()}
                businessHour={fromJS({
                    days: mondayOption!.value,
                    from_time: '09:00',
                    to_time: '18:00',
                })}
            />,
        )

        expect(
            screen.getByText(mondayOption!.label as string),
        ).toBeInTheDocument()
    })

    it('should call onChange with the passed data merged with the new data', () => {
        const spy = jest.fn()
        const tuesdayOption = DEPRECATED_DAYS_OPTIONS.find(
            ({ label }) => label === 'Tuesday',
        )

        render(
            <BusinessHoursForm
                onChange={spy}
                businessHour={{
                    days: mondayOption!.value.toString(),
                    from_time: '09:00',
                    to_time: '18:00',
                }}
            />,
        )

        act(() => {
            screen.getByText(mondayOption!.label as string).click()
            screen.getByText(tuesdayOption!.label as string).click()
        })

        expect(spy).toHaveBeenNthCalledWith(1, {
            days: tuesdayOption!.value,
            from_time: '09:00',
            to_time: '18:00',
        })

        act(() => {
            fireEvent.change(screen.getByDisplayValue('09:00'), {
                target: { value: '15:00' },
            })
        })

        expect(spy).toHaveBeenNthCalledWith(2, {
            days: mondayOption!.value,
            from_time: '15:00',
            to_time: '18:00',
        })
    })
})
