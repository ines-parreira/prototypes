import React from 'react'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'

import DialPad from '../DialPad'

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

describe('<DialPad/>', () => {
    const onDigitClick = jest.fn()
    const onChange = jest.fn()

    const renderComponent = (value?: string) => {
        render(
            <DialPad
                value={value ?? ''}
                onDigitClick={onDigitClick}
                onChange={onChange}
            />,
        )
    }

    afterEach(cleanup)

    it.each(digits)('should trigger onDigitClick', (digit) => {
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText(digit))
        })

        expect(onDigitClick).toHaveBeenCalledWith(digit)
    })

    it('should trigger onChange', () => {
        renderComponent('123')

        act(() => {
            fireEvent.click(screen.getByText(digits[3]))
        })

        expect(onChange).toHaveBeenCalledWith('1234')
    })
})
