import React, { useState } from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PercentageInput } from './PercentageInput'

const renderPercentageInput = (handleChange: jest.Mock) => {
    const Wrapper = () => {
        const [value, setValue] = useState('')
        return (
            <PercentageInput
                value={value}
                onChange={(val) => {
                    setValue(val)
                    handleChange(val)
                }}
            />
        )
    }
    render(<Wrapper />)
}

describe('<PercentageInput />', () => {
    it('should update value correctly', async () => {
        const handleChange = jest.fn()
        renderPercentageInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '420')
        input.blur()

        expect(input).toHaveClass('percentageInput')
        expect(input).toHaveValue(420)
    })
    it('should call onChange', async () => {
        const handleChange = jest.fn()
        renderPercentageInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '420')
        input.blur()

        expect(input).toHaveClass('percentageInput')
        expect(handleChange).toHaveBeenCalledWith('4')
        expect(handleChange).toHaveBeenCalledWith('42')
        expect(handleChange).toHaveBeenCalledWith('420')
        expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('should not allow input with more than 5 characters', async () => {
        const handleChange = jest.fn()
        renderPercentageInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '45.456')
        input.blur()

        expect(input).toHaveValue(45.45)
        expect(input).toHaveClass('percentageInput')
        expect(handleChange).toHaveBeenCalledTimes(4)
    })

    it('should prevent numbers starting with zero', async () => {
        const handleChange = jest.fn()
        renderPercentageInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '042')
        input.blur()

        expect(input).toHaveValue(42)
        expect(input).toHaveClass('percentageInput')
        expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('should trigger validation when number is bigger than 100', async () => {
        const handleChange = jest.fn()
        renderPercentageInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '420')
        input.blur()

        expect(input).toHaveValue(420)
        expect(input).toHaveClass('percentageInput--invalid')
    })

    it('should accept correct input value', async () => {
        const handleChange = jest.fn()
        renderPercentageInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '15')
        input.blur()

        expect(input).toHaveValue(15)
        expect(input).not.toHaveClass('percentageInput--invalid')
    })
})
