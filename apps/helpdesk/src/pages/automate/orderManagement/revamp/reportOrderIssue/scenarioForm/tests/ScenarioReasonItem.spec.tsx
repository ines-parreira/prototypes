import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {
    ReportIssueCaseReason,
    ReportIssueCaseReasonAction,
} from 'models/selfServiceConfiguration/types'

import { ScenarioReasonItem } from '../reasonEditor/ScenarioReasonItem'
import { ScenarioFormContext } from '../ScenarioFormContext'

jest.mock('pages/common/components/accordion/AccordionBody', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/common/components/accordion/SortableAccordionHeader', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

let mockScenarioReasonActionOnChange:
    | ((next: ReportIssueCaseReasonAction) => void)
    | undefined

jest.mock('../reasonEditor/ScenarioReasonAction', () => ({
    ScenarioReasonAction: ({
        value,
        onChange,
    }: {
        value: ReportIssueCaseReasonAction
        onChange: (next: ReportIssueCaseReasonAction) => void
    }) => {
        mockScenarioReasonActionOnChange = onChange
        return (
            <div>
                <span>ScenarioReasonAction</span>
                <span>{value.responseMessageContent.text}</span>
            </div>
        )
    },
}))

const noopContext = { setError: jest.fn() }

const renderComponent = (
    value: ReportIssueCaseReason,
    onChange = jest.fn(),
    onDelete = jest.fn(),
) =>
    render(
        <ScenarioFormContext.Provider value={noopContext}>
            <ScenarioReasonItem
                value={value}
                onChange={onChange}
                onDelete={onDelete}
            />
        </ScenarioFormContext.Provider>,
    )

const makeReason = (
    overrides: Partial<ReportIssueCaseReason> = {},
): ReportIssueCaseReason => ({
    reasonKey: 'reasonOther',
    action: {
        type: 'automated_response',
        responseMessageContent: { html: '', text: '' },
        showHelpfulPrompt: false,
    },
    ...overrides,
})

describe('ScenarioReasonItem', () => {
    beforeEach(() => {
        mockScenarioReasonActionOnChange = undefined
    })

    it('should render the reason label', () => {
        renderComponent(makeReason({ reasonKey: 'reasonCancelOrder' }))

        expect(
            screen.getByText("I'd like to cancel my order"),
        ).toBeInTheDocument()
    })

    it('should show warning icon when action response is empty', () => {
        renderComponent(makeReason())

        expect(
            screen.getByRole('img', { name: 'triangle-warning' }),
        ).toBeInTheDocument()
    })

    it('should not show warning icon when action has content', () => {
        renderComponent(
            makeReason({
                action: {
                    type: 'automated_response',
                    responseMessageContent: {
                        html: '<div>Hello</div>',
                        text: 'Hello',
                    },
                    showHelpfulPrompt: false,
                },
            }),
        )

        expect(
            screen.queryByRole('img', { name: 'triangle-warning' }),
        ).not.toBeInTheDocument()
    })

    it('should call onDelete with reasonKey when Delete is clicked', async () => {
        const user = userEvent.setup()
        const onDelete = jest.fn()

        renderComponent(
            makeReason({ reasonKey: 'reasonCancelOrder' }),
            jest.fn(),
            onDelete,
        )

        await user.click(screen.getByRole('button', { name: /delete/i }))

        expect(onDelete).toHaveBeenCalledWith('reasonCancelOrder')
    })

    it('should call onChange with updated action when ScenarioReasonAction changes', () => {
        const onChange = jest.fn()
        const reason = makeReason({ reasonKey: 'reasonOther' })

        renderComponent(reason, onChange)

        const nextAction: ReportIssueCaseReasonAction = {
            type: 'automated_response',
            responseMessageContent: {
                html: '<div>Updated</div>',
                text: 'Updated',
            },
            showHelpfulPrompt: true,
        }

        mockScenarioReasonActionOnChange!(nextAction)

        expect(onChange).toHaveBeenCalledWith({
            ...reason,
            action: nextAction,
        })
    })

    it('should not show warning icon when action has html but no text', () => {
        renderComponent(
            makeReason({
                action: {
                    type: 'automated_response',
                    responseMessageContent: {
                        html: '<div>Hello</div>',
                        text: '',
                    },
                    showHelpfulPrompt: false,
                },
            }),
        )

        expect(
            screen.queryByRole('img', { name: 'triangle-warning' }),
        ).not.toBeInTheDocument()
    })

    it('should not show warning icon when action has text but no html', () => {
        renderComponent(
            makeReason({
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: 'Hello' },
                    showHelpfulPrompt: false,
                },
            }),
        )

        expect(
            screen.queryByRole('img', { name: 'triangle-warning' }),
        ).not.toBeInTheDocument()
    })

    it('should show warning icon and use default action when action is undefined', () => {
        renderComponent(
            makeReason({
                reasonKey: 'reasonOther',
                action: undefined,
            }),
        )

        expect(screen.getByText('ScenarioReasonAction')).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: 'triangle-warning' }),
        ).toBeInTheDocument()
    })
})
