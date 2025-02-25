import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
    ContactFormFieldName,
    ContactFormFieldType,
} from 'pages/convert/campaigns/types/CampaignAttachment'

import { ContactCaptureStep } from '../ContactCaptureStep'

describe('ContactCaptureStep', () => {
    const mockStep = {
        cta: 'Subscribe',
        fields: [
            {
                label: 'Email',
                name: 'email' as ContactFormFieldName,
                type: ContactFormFieldType.Email,
                required: true,
            },
        ],
    }

    const mockOnSubmit = jest.fn()

    it('renders the step fields correctly', () => {
        render(
            <ContactCaptureStep
                step={mockStep}
                onSubmit={mockOnSubmit}
                disclaimer="Accept the policy"
                disclaimerDefaultAccepted={false}
            />,
        )

        const emailInput = screen.getByPlaceholderText('Email')
        expect(emailInput).toBeInTheDocument()

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()

        const submitButton = screen.getByRole('button', { name: 'Subscribe' })
        expect(submitButton).toBeInTheDocument()
    })

    it('enables submit button only when form is valid and policy is accepted', () => {
        render(
            <ContactCaptureStep
                step={mockStep}
                onSubmit={mockOnSubmit}
                disclaimer="Accept the policy"
                disclaimerDefaultAccepted={false}
            />,
        )

        const submitButton = screen.getByRole('button', { name: 'Subscribe' })
        const emailInput = screen.getByPlaceholderText('Email')
        const checkbox = screen.getByRole('checkbox')

        expect(submitButton).toBeDisabled()

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        expect(submitButton).toBeDisabled()

        fireEvent.click(checkbox)
        expect(submitButton).toBeEnabled()
    })

    it('submits the form and calls onSubmit', async () => {
        render(
            <ContactCaptureStep
                step={mockStep}
                onSubmit={mockOnSubmit}
                disclaimer="Accept the policy"
                disclaimerDefaultAccepted={false}
            />,
        )

        const emailInput = screen.getByPlaceholderText('Email')
        const checkbox = screen.getByRole('checkbox')
        const submitButton = screen.getByRole('button', { name: 'Subscribe' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.click(checkbox)

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                email: 'test@example.com',
            })
        })

        expect(screen.queryByPlaceholderText('Email')).toBeNull()
    })

    it('renders the component with undefined as the default disclaimer selected value', () => {
        render(
            <ContactCaptureStep
                step={mockStep}
                onSubmit={mockOnSubmit}
                disclaimer="Accept the policy"
                disclaimerDefaultAccepted={undefined}
            />,
        )

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox.ariaChecked).toBeFalsy()
    })
})
