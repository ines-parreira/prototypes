import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import type { ContactFormFieldName } from 'pages/convert/campaigns/types/CampaignAttachment'
import { ContactFormFieldType } from 'pages/convert/campaigns/types/CampaignAttachment'

import { EmailCaptureField } from '../EmailCaptureField'

describe('EmailCaptureField', () => {
    const mockField = {
        label: 'Enter your email',
        name: 'email' as ContactFormFieldName,
        type: ContactFormFieldType.Email,
        required: true,
    }

    const mockOnChange = jest.fn()

    it('renders the input field with the correct placeholder', () => {
        render(<EmailCaptureField field={mockField} onChange={mockOnChange} />)
        const emailInput = screen.getByPlaceholderText('Enter your email')
        expect(emailInput).toBeInTheDocument()
    })

    it('uses "Email" as placeholder if no label is provided', () => {
        const fieldWithoutLabel = { ...mockField, label: undefined }
        render(
            <EmailCaptureField
                field={fieldWithoutLabel}
                onChange={mockOnChange}
            />,
        )
        const emailInput = screen.getByPlaceholderText('Email')
        expect(emailInput).toBeInTheDocument()
    })

    it('triggers onChange with valid email input', () => {
        render(<EmailCaptureField field={mockField} onChange={mockOnChange} />)
        const emailInput = screen.getByPlaceholderText('Enter your email')

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        expect(mockOnChange).toHaveBeenCalledWith('test@example.com')
    })

    it('triggers onChange with undefined for invalid email input', () => {
        render(<EmailCaptureField field={mockField} onChange={mockOnChange} />)
        const emailInput = screen.getByPlaceholderText('Enter your email')

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        expect(mockOnChange).toHaveBeenCalledWith(undefined)
    })
})
