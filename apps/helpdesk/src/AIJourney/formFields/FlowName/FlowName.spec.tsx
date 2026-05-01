import { render, screen } from '@testing-library/react'
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
})
