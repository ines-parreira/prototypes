import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { EnableImageField } from './EnableImage'

describe('EnableImageField', () => {
    it('renders the toggle with correct label and unchecked by default', () => {
        render(<EnableImageField />)

        expect(screen.getByText('Include an image')).toBeInTheDocument()
        expect(
            screen.getByText('Send an image in the first message'),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('checkbox')
        expect(toggle).not.toBeChecked()
    })

    it('renders the toggle as checked when isEnabled is true', () => {
        render(<EnableImageField isEnabled={true} />)

        const toggle = screen.getByRole('checkbox')
        expect(toggle).toBeChecked()
    })

    it('calls onChange when toggle is clicked', async () => {
        const mockOnChange = jest.fn()
        render(<EnableImageField onChange={mockOnChange} />)

        const toggle = screen.getByRole('checkbox')
        await act(async () => {
            await userEvent.click(toggle)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('does not error when onChange is not provided', async () => {
        render(<EnableImageField />)

        const toggle = screen.getByRole('checkbox')

        await act(async () => {
            expect(async () => {
                await userEvent.click(toggle)
            }).not.toThrow()
        })
    })

    it('renders correctly with both isEnabled and onChange props', async () => {
        const mockOnChange = jest.fn()
        render(<EnableImageField isEnabled={true} onChange={mockOnChange} />)

        const toggle = screen.getByRole('checkbox')
        expect(toggle).toBeChecked()

        await act(async () => {
            await userEvent.click(toggle)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
})
