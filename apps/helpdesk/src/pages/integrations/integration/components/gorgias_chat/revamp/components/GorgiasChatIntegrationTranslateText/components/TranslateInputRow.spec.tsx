import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TranslateInputRow } from './TranslateInputRow'

jest.mock('@gorgias/axiom', () => ({
    TextAreaField: ({
        value,
        isDisabled,
        isRequired,
        onChange,
        'aria-label': ariaLabel,
        placeholder,
    }: {
        value: string
        isDisabled?: boolean
        isRequired?: boolean
        onChange?: (value: string) => void
        'aria-label'?: string
        placeholder?: string
    }) => (
        <input
            value={value}
            disabled={isDisabled}
            required={isRequired}
            onChange={(e) => onChange?.(e.target.value)}
            aria-label={ariaLabel}
            placeholder={placeholder}
        />
    ),
}))

const defaultProps = {
    keyName: 'texts.chatTitle',
    value: 'Hello',
    defaultValue: 'Default Hello',
    maxLength: 100,
    isRequired: false,
    saveValue: jest.fn(),
}

describe('TranslateInputRow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render the default value in the disabled input', () => {
            render(<TranslateInputRow {...defaultProps} />)

            const disabledInput = screen.getByRole('textbox', {
                name: /default text/i,
            })
            expect(disabledInput).toBeDisabled()
            expect(disabledInput).toHaveValue('Default Hello')
        })

        it('should render the editable input with the initial value', () => {
            render(<TranslateInputRow {...defaultProps} />)

            const editableInput = screen.getByRole('textbox', {
                name: /default hello/i,
            })
            expect(editableInput).not.toBeDisabled()
            expect(editableInput).toHaveValue('Hello')
        })

        it('should use the default value as placeholder for the editable input', () => {
            render(<TranslateInputRow {...defaultProps} />)

            expect(
                screen.getByPlaceholderText('Default Hello'),
            ).toBeInTheDocument()
        })

        it('should pass isRequired to the editable input when true', () => {
            render(<TranslateInputRow {...defaultProps} isRequired />)

            const editableInput = screen.getByRole('textbox', {
                name: /default hello/i,
            })
            expect(editableInput).toBeRequired()
        })

        it('should not be required when isRequired is false', () => {
            render(<TranslateInputRow {...defaultProps} isRequired={false} />)

            const editableInput = screen.getByRole('textbox', {
                name: /default hello/i,
            })
            expect(editableInput).not.toBeRequired()
        })

        it('should render empty editable input when value is empty string', () => {
            render(<TranslateInputRow {...defaultProps} value="" />)

            const editableInput = screen.getByRole('textbox', {
                name: /default hello/i,
            })
            expect(editableInput).toHaveValue('')
        })
    })

    describe('user interaction', () => {
        it('should update the editable input value as the user types', async () => {
            const user = userEvent.setup()
            render(<TranslateInputRow {...defaultProps} value="" />)

            const editableInput = screen.getByRole('textbox', {
                name: /default hello/i,
            })
            await user.type(editableInput, 'New value')

            expect(editableInput).toHaveValue('New value')
        })

        it('should call saveValue with the key and new value on each change', async () => {
            const user = userEvent.setup()
            const saveValue = jest.fn()
            render(
                <TranslateInputRow
                    {...defaultProps}
                    value=""
                    saveValue={saveValue}
                />,
            )

            const editableInput = screen.getByRole('textbox', {
                name: /default hello/i,
            })
            await user.type(editableInput, 'Hi')

            expect(saveValue).toHaveBeenCalledWith('texts.chatTitle', 'H')
            expect(saveValue).toHaveBeenCalledWith('texts.chatTitle', 'Hi')
        })

        it('should not allow typing in the disabled default input', async () => {
            const user = userEvent.setup()
            render(<TranslateInputRow {...defaultProps} />)

            const disabledInput = screen.getByRole('textbox', {
                name: /default text/i,
            })
            await user.type(disabledInput, 'attempt')

            expect(disabledInput).toHaveValue('Default Hello')
        })
    })
})
