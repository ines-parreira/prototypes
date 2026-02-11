import React, { useState } from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { MinutesInput } from './MinutesInput'

const renderMinutesInput = (
    handleChange: jest.Mock,
    handleValidationChange?: jest.Mock,
    max?: number,
    isDisabled?: boolean,
) => {
    const Wrapper = () => {
        const [value, setValue] = useState<number | undefined>(undefined)
        return (
            <MinutesInput
                value={value}
                max={max}
                isDisabled={isDisabled}
                onChange={(val) => {
                    setValue(val)
                    handleChange(val)
                }}
                onValidationChange={handleValidationChange}
            />
        )
    }
    render(<Wrapper />)
}

describe('<MinutesInput />', () => {
    it('should render with initial value', () => {
        const handleChange = jest.fn()
        render(<MinutesInput value={10} onChange={handleChange} />)

        const input = screen.getByRole('spinbutton')
        expect(input).toHaveValue(10)
    })

    it('should update value correctly when typing', async () => {
        const handleChange = jest.fn()
        renderMinutesInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '45')

        expect(input).toHaveValue(45)
        expect(handleChange).toHaveBeenCalledWith(4)
        expect(handleChange).toHaveBeenCalledWith(45)
        expect(handleChange).toHaveBeenCalledTimes(2)
    })

    it('should call onChange with undefined when field is cleared', async () => {
        const handleChange = jest.fn()
        renderMinutesInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '30')
        handleChange.mockClear()

        await userEvent.clear(input)

        expect(handleChange).toHaveBeenCalledWith(undefined)
        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('should validate when exceeding max value', async () => {
        const handleChange = jest.fn()
        const handleValidationChange = jest.fn()
        renderMinutesInput(handleChange, handleValidationChange, 100)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '150')

        expect(input).toHaveValue(150)
        expect(input).toHaveClass('minutesInput--invalid')
        expect(handleValidationChange).toHaveBeenCalledWith(false)
    })

    it('should mark input as valid for correct values', async () => {
        const handleChange = jest.fn()
        const handleValidationChange = jest.fn()
        renderMinutesInput(handleChange, handleValidationChange, 100)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '50')

        expect(input).toHaveValue(50)
        expect(input).not.toHaveClass('minutesInput--invalid')
        expect(handleValidationChange).toHaveBeenCalledWith(true)
    })

    it('should call onValidationChange with false when field is cleared', async () => {
        const handleChange = jest.fn()
        const handleValidationChange = jest.fn()
        renderMinutesInput(handleChange, handleValidationChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '30')
        handleValidationChange.mockClear()

        await userEvent.clear(input)

        expect(handleValidationChange).toHaveBeenCalledWith(false)
    })

    it('should handle disabled state correctly', () => {
        const handleChange = jest.fn()
        const handleValidationChange = jest.fn()
        renderMinutesInput(
            handleChange,
            handleValidationChange,
            undefined,
            true,
        )

        const input = screen.getByRole('spinbutton')

        expect(input).toBeDisabled()
        expect(handleValidationChange).toHaveBeenCalledWith(true)
    })

    it('should display minutes decorator', () => {
        const handleChange = jest.fn()
        render(<MinutesInput value={10} onChange={handleChange} />)

        expect(screen.getByText('min')).toBeInTheDocument()
    })

    it('should accept zero as a valid value', async () => {
        const handleChange = jest.fn()
        renderMinutesInput(handleChange)

        const input = screen.getByRole('spinbutton')

        await userEvent.type(input, '0')

        expect(input).toHaveValue(0)
        expect(handleChange).toHaveBeenCalledWith(0)
    })

    it('should handle step increments correctly', () => {
        const handleChange = jest.fn()
        render(<MinutesInput value={10} onChange={handleChange} />)

        const input = screen.getByRole('spinbutton')

        expect(input).toHaveAttribute('step', '1')
    })
})
