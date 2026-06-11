import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {
    ReportIssueCaseReason,
    ReportIssueCaseReasonAction,
} from 'models/selfServiceConfiguration/types'

import { ScenarioReasonItem } from '../reasonEditor/ScenarioReasonItem'
import { ScenarioFormContext } from '../ScenarioFormContext'

jest.mock('pages/common/components/accordion/AccordionBody', () => ({
    __esModule: true,
    AccordionBody: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/common/components/accordion/SortableAccordionHeader', () => ({
    __esModule: true,
    SortableAccordionHeader: ({ children }: { children?: React.ReactNode }) => (
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
            screen.getByRole('img', { name: 'warning-triangle' }),
        ).toBeInTheDocument()
    })

    it('should show warning tooltip when focusing the empty response warning icon', async () => {
        const user = userEvent.setup()

        renderComponent(makeReason())

        const warningIcon = screen.getByRole('img', {
            name: 'warning-triangle',
        })
        const trigger = warningIcon.closest('[data-name="tooltip-trigger"]')

        if (!(trigger instanceof HTMLElement)) {
            throw new Error('Tooltip trigger not found')
        }

        await act(async () => {
            await user.tab()
        })

        expect(trigger).toHaveFocus()

        expect(await screen.findByRole('tooltip')).toHaveTextContent(
            'Response is not configured for this issue option.',
        )
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
            screen.queryByRole('img', { name: 'warning-triangle' }),
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
            screen.queryByRole('img', { name: 'warning-triangle' }),
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
            screen.queryByRole('img', { name: 'warning-triangle' }),
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
            screen.getByRole('img', { name: 'warning-triangle' }),
        ).toBeInTheDocument()
    })
})
