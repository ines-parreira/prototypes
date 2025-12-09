import { act } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
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

    it('should call onValueChange when value is changed and field is blurred', async () => {
        const onValueChange = vi.fn()

        const { user, getByDisplayValue } = render(
            <EditableField
                value="Initial value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('Initial value')

        await act(async () => {
            await user.clear(input)
            await user.type(input, 'New value')
        })

        act(() => input.blur())

        expect(onValueChange).toHaveBeenCalledWith('New value')
    })

    it('should not call onValueChange when value is unchanged', async () => {
        const onValueChange = vi.fn()

        const { user, getByDisplayValue } = render(
            <EditableField
                value="Test value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('Test value')

        await act(async () => {
            await user.clear(input)
            await user.type(input, 'Test value')
        })

        act(() => input.blur())

        expect(onValueChange).not.toHaveBeenCalled()
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

    it('should trim whitespace before submitting', async () => {
        const onValueChange = vi.fn()

        const { user, getByDisplayValue } = render(
            <EditableField
                value="Test"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('Test')

        await act(async () => {
            await user.clear(input)
            await user.type(input, '  New value  ')
        })

        act(() => input.blur())

        expect(onValueChange).toHaveBeenCalledWith('New value')
    })

    it('should show validation error when validator returns error message', async () => {
        const onValueChange = vi.fn()

        const { user, getByDisplayValue, getByText } = render(
            <EditableField
                value="test@example.com"
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('test@example.com')

        await act(async () => {
            await user.clear(input)
            await user.type(input, 'invalid-email')
        })

        act(() => input.blur())

        expect(getByText('Invalid email address')).toBeInTheDocument()
        expect(onValueChange).not.toHaveBeenCalled()
    })

    it('should clear validation error when user starts typing', async () => {
        const onValueChange = vi.fn()

        const { user, getByDisplayValue, getByText, queryByText } = render(
            <EditableField
                value="test@example.com"
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('test@example.com')

        await act(async () => {
            await user.clear(input)
            await user.type(input, 'invalid')
        })

        act(() => input.blur())

        expect(getByText('Invalid email address')).toBeInTheDocument()

        await act(async () => {
            await user.type(input, '@')
        })

        expect(queryByText('Invalid email address')).not.toBeInTheDocument()
    })

    it('should call onValueChange when validation passes', async () => {
        const onValueChange = vi.fn()

        const { user, getByDisplayValue } = render(
            <EditableField
                value="test@example.com"
                onValueChange={onValueChange}
                validator={mockValidator}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('test@example.com')

        await act(async () => {
            await user.clear(input)
            await user.type(input, 'new@example.com')
        })

        act(() => input.blur())

        expect(mockValidator).toHaveBeenLastCalledWith('new@example.com')
        expect(onValueChange).toHaveBeenCalledWith('new@example.com')
    })

    it('should render custom display when renderDisplay is provided', () => {
        const onValueChange = vi.fn()
        const renderDisplay = vi.fn((value: string) => (
            <div>Custom: {value}</div>
        ))

        const { getByText } = render(
            <EditableField
                value="Test value"
                onValueChange={onValueChange}
                renderDisplay={renderDisplay}
                placeholder="+ Add"
            />,
        )

        expect(getByText('Custom: Test value')).toBeInTheDocument()
    })

    it('should switch to edit mode when custom display is clicked', async () => {
        const onValueChange = vi.fn()
        const renderDisplay = vi.fn((value: string, onClick: () => void) => (
            <button type="button" onClick={onClick}>
                trigger
            </button>
        ))

        const { user, getByRole, getByDisplayValue } = render(
            <EditableField
                value="Test value"
                onValueChange={onValueChange}
                renderDisplay={renderDisplay}
                placeholder="+ Add"
            />,
        )

        const button = getByRole('button', { name: 'trigger' })

        await act(() => user.click(button))

        expect(getByDisplayValue('Test value')).toBeInTheDocument()
    })

    it('should render TextField when renderDisplay is provided but value is empty', () => {
        const onValueChange = vi.fn()
        const renderDisplay = vi.fn((value: string) => (
            <div>Custom: {value}</div>
        ))

        const { getByPlaceholderText, queryByText } = render(
            <EditableField
                value=""
                onValueChange={onValueChange}
                renderDisplay={renderDisplay}
                placeholder="+ Add note"
            />,
        )

        expect(getByPlaceholderText('+ Add note')).toBeInTheDocument()
        expect(queryByText(/Custom:/)).not.toBeInTheDocument()
        expect(renderDisplay).not.toHaveBeenCalled()
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

    it('should not update input value when editing', async () => {
        const onValueChange = vi.fn()

        const { user, rerender, getByDisplayValue } = render(
            <EditableField
                value="Initial value"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        const input = getByDisplayValue('Initial value')

        await act(async () => {
            await user.clear(input)
            await user.type(input, 'User typing...')
        })

        rerender(
            <EditableField
                value="External update"
                onValueChange={onValueChange}
                placeholder="+ Add"
            />,
        )

        expect(getByDisplayValue('User typing...')).toBeInTheDocument()
    })
})
