import React from 'react'

import { render, screen } from '@testing-library/react'
import { useFormState } from 'react-hook-form'

import { assumeMock } from 'utils/testing'

import QueueFormSubmitButton from '../QueueFormSubmitButton'

jest.mock('react-hook-form', () => ({
    useFormState: jest.fn(),
}))

const useFormStateMock = assumeMock(useFormState)

type FormState = {
    isDirty: boolean
    isValid: boolean
}

describe('QueueFormSubmitButton', () => {
    const defaultFormState: FormState = {
        isDirty: true,
        isValid: true,
    }

    const renderComponent = (
        formState: Partial<FormState> = {},
        children: string = 'Save Queue',
    ) => {
        useFormStateMock.mockReturnValue({
            ...defaultFormState,
            ...formState,
        } as ReturnType<typeof useFormState>)

        render(<QueueFormSubmitButton>{children}</QueueFormSubmitButton>)

        return {
            button: screen.getByRole('button', { name: children }),
        }
    }

    beforeEach(() => {
        useFormStateMock.mockReturnValue(
            defaultFormState as ReturnType<typeof useFormState>,
        )
    })

    it('should render children content', () => {
        const { button } = renderComponent()
        expect(button).toBeInTheDocument()
    })

    it('should be enabled when form is valid and dirty', () => {
        const { button } = renderComponent({ isDirty: true, isValid: true })
        expect(button).toBeAriaEnabled()
    })

    it('should be disabled when form is invalid', () => {
        const { button } = renderComponent({ isValid: false })
        expect(button).toBeAriaDisabled()
    })

    it('should be disabled when form is not dirty', () => {
        const { button } = renderComponent({ isDirty: false })
        expect(button).toBeAriaDisabled()
    })

    it('should be disabled when form is both invalid and not dirty', () => {
        const { button } = renderComponent({ isDirty: false, isValid: false })
        expect(button).toBeAriaDisabled()
    })
})
