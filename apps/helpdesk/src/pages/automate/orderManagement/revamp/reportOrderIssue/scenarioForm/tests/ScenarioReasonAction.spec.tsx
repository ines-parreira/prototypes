import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ReportIssueCaseReasonAction } from 'models/selfServiceConfiguration/types'

import { ScenarioReasonAction } from '../reasonEditor/ScenarioReasonAction'
import { ScenarioFormContext } from '../ScenarioFormContext'

jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    return {
        ...actual,
        Box: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
        Text: ({ children }: { children: React.ReactNode }) => (
            <span>{children}</span>
        ),
        TextAreaField: ({
            value,
            onChange,
            isInvalid,
            'aria-label': ariaLabel,
        }: {
            value: string
            onChange: (text: string) => void
            isInvalid?: boolean
            'aria-label'?: string
            maxLength?: number
            rows?: number
        }) => (
            <textarea
                aria-label={ariaLabel}
                aria-invalid={isInvalid}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        ),
        ToggleField: ({
            value,
            onChange,
            isDisabled,
            label,
        }: {
            value: boolean
            onChange: (next: boolean) => void
            isDisabled?: boolean
            label: string
            caption?: string
        }) => (
            <input
                type="checkbox"
                aria-label={label}
                checked={value}
                disabled={isDisabled}
                onChange={(e) => onChange(e.target.checked)}
            />
        ),
    }
})

const noopContext = { setError: jest.fn() }

const makeAction = (
    overrides: Partial<ReportIssueCaseReasonAction> = {},
): ReportIssueCaseReasonAction => ({
    type: 'automated_response',
    responseMessageContent: { html: '', text: '' },
    showHelpfulPrompt: false,
    ...overrides,
})

const renderComponent = (
    value: ReportIssueCaseReasonAction,
    onChange = jest.fn(),
) =>
    render(
        <ScenarioFormContext.Provider value={noopContext}>
            <ScenarioReasonAction
                reasonKey="test"
                value={value}
                onChange={onChange}
            />
        </ScenarioFormContext.Provider>,
    )

describe('ScenarioReasonAction', () => {
    it('should render the response text area with current value', () => {
        renderComponent(
            makeAction({
                responseMessageContent: {
                    html: '<div>Hello</div>',
                    text: 'Hello',
                },
            }),
        )

        expect(screen.getByLabelText('Response text')).toHaveValue('Hello')
    })

    it('should call onChange with updated text and HTML when text changes', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        renderComponent(makeAction(), onChange)

        await user.type(screen.getByLabelText('Response text'), 'H')

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                responseMessageContent: {
                    html: '<div>H</div>',
                    text: 'H',
                },
            }),
        )
    })

    it('should reset showHelpfulPrompt to false when text is cleared', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        renderComponent(
            makeAction({
                responseMessageContent: {
                    html: '<div>A</div>',
                    text: 'A',
                },
                showHelpfulPrompt: true,
            }),
            onChange,
        )

        await user.clear(screen.getByLabelText('Response text'))

        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                responseMessageContent: { html: '', text: '' },
                showHelpfulPrompt: false,
            }),
        )
    })

    it('should preserve showHelpfulPrompt when text has content', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        renderComponent(
            makeAction({
                responseMessageContent: {
                    html: '<div>Hey</div>',
                    text: 'Hey',
                },
                showHelpfulPrompt: true,
            }),
            onChange,
        )

        await user.type(screen.getByLabelText('Response text'), 'x')

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                showHelpfulPrompt: true,
            }),
        )
    })

    it('should render the toggle field', () => {
        renderComponent(makeAction())

        expect(
            screen.getByLabelText('Ask customers if your response was helpful'),
        ).toBeInTheDocument()
    })

    it('should call onChange with updated showHelpfulPrompt when toggle changes', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        renderComponent(
            makeAction({
                responseMessageContent: {
                    html: '<div>Some text</div>',
                    text: 'Some text',
                },
                showHelpfulPrompt: false,
            }),
            onChange,
        )

        await user.click(
            screen.getByLabelText('Ask customers if your response was helpful'),
        )

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                showHelpfulPrompt: true,
            }),
        )
    })

    it('should disable the toggle when text is empty', () => {
        renderComponent(makeAction())

        expect(
            screen.getByLabelText('Ask customers if your response was helpful'),
        ).toBeDisabled()
    })
})
