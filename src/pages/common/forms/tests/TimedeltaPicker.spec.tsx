import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import {TIMEDELTA_OPERATOR_DEFAULT_QUANTITY} from 'config'

import TimedeltaPicker from '../TimedeltaPicker'

describe('TimedeltaPicker component', () => {
    const minProps: ComponentProps<typeof TimedeltaPicker> = {
        value: '',
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render correct passed data', () => {
        const {container} = render(<TimedeltaPicker {...minProps} value="2w" />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ignore incorrect passed data and use default values instead', () => {
        const {container} = render(<TimedeltaPicker {...minProps} value="d1" />)

        expect(container.getElementsByTagName('input')[0].value).toBe(
            `${TIMEDELTA_OPERATOR_DEFAULT_QUANTITY}`
        )
        expect(container.getElementsByTagName('button')[2].textContent).toMatch(
            /day/i
        )
    })

    it('should handle unit change', () => {
        const {getAllByText, getByText} = render(
            <TimedeltaPicker {...minProps} />
        )

        fireEvent.click(getAllByText('arrow_drop_down')[1])

        fireEvent.click(getByText(/week/i))
        expect(minProps.onChange).toHaveBeenLastCalledWith('1w')

        fireEvent.click(getByText(/minute/i))
        expect(minProps.onChange).toHaveBeenLastCalledWith('1m')
    })

    it('should handle quantity change', () => {
        const {container} = render(<TimedeltaPicker {...minProps} />)

        const firstValue = '5'
        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {
                value: firstValue,
            },
        })
        expect(minProps.onChange).toHaveBeenLastCalledWith(`${firstValue}d`)

        const secondValue = '5'
        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {
                value: secondValue,
            },
        })
        expect(minProps.onChange).toHaveBeenLastCalledWith(`${secondValue}d`)
    })

    it('should display received value and unit', () => {
        const value = '5'
        const {container} = render(
            <TimedeltaPicker {...minProps} value={`${value}w`} />
        )

        expect(container.getElementsByTagName('input')[0].value).toBe(
            `${value}`
        )
        expect(container.getElementsByTagName('button')[2].textContent).toMatch(
            /week/i
        )
    })

    it('should forward minimum and maximum quantity', () => {
        const min = 5
        const max = 10
        const {container} = render(
            <TimedeltaPicker {...minProps} value="5d" min={min} max={max} />
        )

        expect(container.getElementsByTagName('input')[0].min).toEqual(`${min}`)
        expect(container.getElementsByTagName('input')[0].max).toEqual(`${max}`)
    })
})
