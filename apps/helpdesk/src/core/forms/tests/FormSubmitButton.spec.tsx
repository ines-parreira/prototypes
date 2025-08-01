import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { useFormState } from 'react-hook-form'

import { FormSubmitButton } from '../components/FormSubmitButton'

jest.mock('react-hook-form', () => ({
    useFormState: jest.fn(),
}))

const useFormStateMock = assumeMock(useFormState)

describe('FormSubmitButton', () => {
    beforeEach(() => {
        useFormStateMock.mockReturnValue({
            isDirty: true,
        } as ReturnType<typeof useFormState>)
    })

    it('allows customizing the label text', () => {
        render(<FormSubmitButton>Next Step</FormSubmitButton>)
        const button = screen.getByRole('button', { name: 'Next Step' })
        expect(button).toBeInTheDocument()
    })

    it('allows setting loading state', () => {
        render(<FormSubmitButton isLoading />)
        const button = screen.getByRole('button', {
            name: 'Loading... Save Changes',
        })
        expect(button).toBeInTheDocument()
        expect(button).toBeAriaDisabled()
    })

    it('should be disabled or not according to form state', () => {
        useFormStateMock.mockReturnValueOnce({
            isDirty: false,
        } as ReturnType<typeof useFormState>)

        render(<FormSubmitButton />)
        const button = screen.getByRole('button', {
            name: 'Save Changes',
        })

        expect(button).toBeAriaDisabled()
    })

    it('allows overriding disabled state', () => {
        render(<FormSubmitButton isDisabled />)
        const button = screen.getByRole('button', {
            name: 'Save Changes',
        })

        expect(button).toBeAriaDisabled()
    })
})
