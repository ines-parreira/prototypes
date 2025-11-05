import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CampaignTitle } from './CampaignTitle'

describe('CampaignTitle', () => {
    it('should render with campaign name field', () => {
        render(<CampaignTitle />)

        expect(screen.getByText('Campaign name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Campaign name')).toBeInTheDocument()
    })

    it('should display provided value', () => {
        render(<CampaignTitle value="Test Campaign" />)

        const input = screen.getByPlaceholderText(
            'Campaign name',
        ) as HTMLInputElement
        expect(input.value).toBe('Test Campaign')
    })

    it('should call onChange when user types', async () => {
        const handleChange = jest.fn()
        const user = userEvent.setup()
        render(<CampaignTitle onChange={handleChange} />)

        const input = screen.getByPlaceholderText('Campaign name')
        await user.type(input, 'New Campaign')

        expect(handleChange).toHaveBeenCalled()
        expect(handleChange).toHaveBeenLastCalledWith('New Campaign')
    })

    it('should show validation error when field is empty on blur', async () => {
        const handleValidationChange = jest.fn()
        render(
            <CampaignTitle
                value=""
                onValidationChange={handleValidationChange}
            />,
        )

        const input = screen.getByPlaceholderText('Campaign name')
        fireEvent.blur(input)

        await waitFor(() => {
            expect(
                screen.getByText('Campaign name is required.'),
            ).toBeInTheDocument()
        })

        expect(handleValidationChange).toHaveBeenCalledWith(false)
    })

    it('should not show error when field has valid value', async () => {
        const handleValidationChange = jest.fn()
        render(
            <CampaignTitle
                value="Valid Campaign"
                onValidationChange={handleValidationChange}
            />,
        )

        const input = screen.getByPlaceholderText('Campaign name')
        fireEvent.blur(input)

        await waitFor(() => {
            expect(
                screen.queryByText('Campaign name is required.'),
            ).not.toBeInTheDocument()
        })

        expect(handleValidationChange).toHaveBeenCalledWith(true)
    })

    it('should be disabled when isDisabled is true', () => {
        render(<CampaignTitle isDisabled={true} />)

        const input = screen.getByPlaceholderText('Campaign name')
        expect(input).toBeDisabled()
    })

    it('should clear value when component becomes disabled', () => {
        const handleChange = jest.fn()
        const { rerender } = render(
            <CampaignTitle
                value="Existing Campaign"
                isDisabled={false}
                onChange={handleChange}
            />,
        )

        rerender(
            <CampaignTitle
                value="Existing Campaign"
                isDisabled={true}
                onChange={handleChange}
            />,
        )

        expect(handleChange).toHaveBeenCalledWith('')
    })

    it('should validate whitespace-only input as invalid', async () => {
        const handleValidationChange = jest.fn()
        render(
            <CampaignTitle
                value="   "
                onValidationChange={handleValidationChange}
            />,
        )

        const input = screen.getByPlaceholderText('Campaign name')
        fireEvent.blur(input)

        await waitFor(() => {
            expect(
                screen.getByText('Campaign name is required.'),
            ).toBeInTheDocument()
        })

        expect(handleValidationChange).toHaveBeenCalledWith(false)
    })
})
