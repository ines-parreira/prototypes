import React from 'react'

import { act, waitFor } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { EditableField } from '../EditableField'

const mockValidator = vi.fn((value: string) => {
    if (!value.includes('@')) {
        return 'Invalid email address'
    }
    return undefined
})

describe('EditableField', () => {
    it('should render TextField with placeholder when no value', () => {
        const onValueChange = vi.fn()

        const { getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                placeholder="+ Add note"
            />,
        )

        expect(getByPlaceholderText('+ Add note')).toBeInTheDocument()
    })

    it('should render TextField with value', () => {
        const onValueChange = vi.fn()

        const { getByDisplayValue } = render(
            <EditableField
                value="Test value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('Test value')).toBeInTheDocument()
    })

    it('should call onValueChange on every keystroke', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(async () => {
            await user.type(input, 'New')
        })

        expect(onValueChange).toHaveBeenCalled()
        expect(onValueChange.mock.calls.length).toBeGreaterThan(0)
    })

    it('should not call onValueChange when empty value is submitted and current value is also empty', async () => {
        const onValueChange = vi.fn()

        const { getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        act(() => input.blur())

        expect(onValueChange).not.toHaveBeenCalled()
    })

    it('should trim whitespace on blur', async () => {
        function ControlledField() {
            const [value, setValue] = React.useState('')
            return (
                <EditableField
                    value={value}
                    onValueChange={setValue}
                    placeholder="+ Add"
                />
            )
        }

        const { user, getByPlaceholderText } = render(<ControlledField />)

        const input = getByPlaceholderText('+ Add')

        await act(async () => {
            await user.type(input, '  New value  ')
            input.blur()
        })

        expect(input).toHaveValue('New value')
    })

    it('should show validation error when validator returns error message on blur', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(async () => {
            await user.type(input, 'invalid-email')
        })

        expect(input).toHaveAttribute('aria-invalid', 'false')

        await act(async () => {
            input.blur()
        })

        await waitFor(() => {
            expect(input).toHaveAttribute('aria-invalid', 'true')
        })
    })

    it('should clear validation error when user starts typing', async () => {
        const onValueChange = vi.fn()

        const { user, getByPlaceholderText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByPlaceholderText('+ Add')

        await act(async () => {
            await user.type(input, 'invalid')
        })

        await act(async () => {
            input.blur()
        })

        await waitFor(() => {
            expect(input).toHaveAttribute('aria-invalid', 'true')
        })

        await act(async () => {
            await user.type(input, '@')
        })

        expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should call onValueChange during typing and pass validation on blur', async () => {
        function ControlledField() {
            const [value, setValue] = React.useState('')
            return (
                <EditableField
                    value={value}
                    onValueChange={setValue}
                    validator={mockValidator}
                    placeholder="+ Add"
                />
            )
        }

        const { user, getByPlaceholderText } = render(<ControlledField />)

        const input = getByPlaceholderText('+ Add')

        await act(async () => {
            await user.type(input, 'new@example.com')
            input.blur()
        })

        expect(mockValidator).toHaveBeenLastCalledWith('new@example.com')
        expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should update input value when prop value changes', () => {
        const onValueChange = vi.fn()

        const { rerender, getByDisplayValue } = render(
            <EditableField
                value="Initial value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('Initial value')).toBeInTheDocument()

        rerender(
            <EditableField
                value="Updated value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('Updated value')).toBeInTheDocument()
    })
})
