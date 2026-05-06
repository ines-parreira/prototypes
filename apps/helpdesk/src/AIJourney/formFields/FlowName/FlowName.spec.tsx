import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FlowName } from './FlowName'

let capturedControllerProps: Record<string, unknown> = {}

jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    useFormContext: jest.fn(() => ({
        control: {},
        register: jest.fn(),
        formState: { errors: {} },
    })),
    Controller: (props: {
        rules?: Record<string, unknown>
        render: (renderProps: {
            field: { value: string; onChange: () => void }
            fieldState: { error?: { message?: string } }
        }) => React.ReactNode
    }) => {
        capturedControllerProps = props
        return props.render({
            field: { value: '', onChange: jest.fn() },
            fieldState: {},
        })
    },
}))

describe('<FlowName />', () => {
    beforeEach(() => {
        capturedControllerProps = {}
    })

    it('renders a text field labeled "Flow name"', () => {
        render(<FlowName />)

        expect(screen.getByLabelText(/flow name/i)).toBeInTheDocument()
    })

    it('marks the field as required', () => {
        render(<FlowName />)

        const input = screen.getByLabelText(/flow name/i)
        expect(input).toBeRequired()
    })

    it('passes a required validation rule to Controller', () => {
        render(<FlowName />)

        expect(capturedControllerProps.rules).toEqual(
            expect.objectContaining({
                required: 'Flow name is required',
                validate: expect.any(Function),
            }),
        )
    })

    it('rejects whitespace-only values', () => {
        render(<FlowName />)

        const validate = (capturedControllerProps.rules as Record<string, any>)
            .validate as (value?: string) => true | string

        expect(validate('   ')).toBe('Flow name is required')
        expect(validate('Custom flow')).toBe(true)
    })

    it('displays validation error when field state has error', () => {
        jest.requireMock('react-hook-form').Controller = (props: {
            rules?: Record<string, unknown>
            render: (renderProps: {
                field: { value: string; onChange: () => void }
                fieldState: { error?: { message?: string } }
            }) => React.ReactNode
        }) => {
            capturedControllerProps = props
            return props.render({
                field: { value: '', onChange: jest.fn() },
                fieldState: {
                    error: { message: 'Flow name is required' },
                },
            })
        }

        render(<FlowName />)

        expect(screen.getByText('Flow name is required')).toBeInTheDocument()
    })

    it('accepts text input', async () => {
        const user = userEvent.setup()
        render(<FlowName />)

        const input = screen.getByLabelText(/flow name/i)
        await user.type(input, 'My custom flow')

        expect(input).toBeInTheDocument()
    })

    describe('onChange wiring', () => {
        // The TextField's onChange prop is the wrapper FlowName installs
        // around field.onChange. These tests pull that wrapper directly out of
        // the rendered element and exercise it with raw string inputs, then
        // assert what the underlying field.onChange mock received. This is the
        // unit boundary that AIJOU-1977 broke: trim ran on every keystroke and
        // stripped spaces before they could be stored.
        const renderAndGetTextFieldOnChange = () => {
            render(<FlowName />)
            const renderProp = capturedControllerProps.render as (args: {
                field: { value: string; onChange: jest.Mock }
                fieldState: Record<string, unknown>
            }) => React.ReactElement<{ onChange: (value: string) => void }>
            const fieldOnChange = jest.fn()
            const element = renderProp({
                field: { value: '', onChange: fieldOnChange },
                fieldState: {},
            })
            return { fieldOnChange, textFieldOnChange: element.props.onChange }
        }

        it('preserves internal spaces between words', () => {
            const { fieldOnChange, textFieldOnChange } =
                renderAndGetTextFieldOnChange()

            textFieldOnChange('My custom flow')

            expect(fieldOnChange).toHaveBeenCalledWith('My custom flow')
        })

        it('preserves trailing space mid-edit so the next character can land', () => {
            const { fieldOnChange, textFieldOnChange } =
                renderAndGetTextFieldOnChange()

            textFieldOnChange('My ')

            expect(fieldOnChange).toHaveBeenCalledWith('My ')
        })

        it('preserves leading space mid-edit', () => {
            const { fieldOnChange, textFieldOnChange } =
                renderAndGetTextFieldOnChange()

            textFieldOnChange(' My')

            expect(fieldOnChange).toHaveBeenCalledWith(' My')
        })

        it('passes whitespace-only values through to field.onChange (validate rejects them)', () => {
            const { fieldOnChange, textFieldOnChange } =
                renderAndGetTextFieldOnChange()

            textFieldOnChange('   ')

            // onChange must not silently swallow this — the validate rule is
            // the authority on whitespace-only rejection at submit time, and it
            // needs to see the actual value to fire its error message.
            expect(fieldOnChange).toHaveBeenCalledWith('   ')
        })

        it('coerces null/undefined to empty string defensively', () => {
            const { fieldOnChange, textFieldOnChange } =
                renderAndGetTextFieldOnChange()

            textFieldOnChange(undefined as unknown as string)

            expect(fieldOnChange).toHaveBeenCalledWith('')
        })
    })
})
