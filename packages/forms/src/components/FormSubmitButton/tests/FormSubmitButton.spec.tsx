import React from 'react'

import { assumeMock } from '@repo/testing/vitest'
import { render, screen } from '@testing-library/react'
import { useFormState } from 'react-hook-form'
import { vi } from 'vitest'

import { FormSubmitButton } from '../FormSubmitButton'

vi.mock('react-hook-form', () => ({
    useFormState: vi.fn(),
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
        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should be disabled or not according to form state', () => {
        useFormStateMock.mockReturnValueOnce({
            isDirty: false,
        } as ReturnType<typeof useFormState>)

        render(<FormSubmitButton />)
        const button = screen.getByRole('button', {
            name: 'Save Changes',
        })

        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('allows overriding disabled state', () => {
        render(<FormSubmitButton isDisabled />)
        const button = screen.getByRole('button', {
            name: 'Save Changes',
        })

        expect(button).toHaveAttribute('aria-disabled', 'true')
    })
})
