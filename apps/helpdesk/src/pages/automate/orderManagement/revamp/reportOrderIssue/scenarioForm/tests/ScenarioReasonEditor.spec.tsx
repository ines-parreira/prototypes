import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ReportIssueCaseReason } from 'models/selfServiceConfiguration/types'

import { ScenarioReasonEditor } from '../reasonEditor/ScenarioReasonEditor'
import { ScenarioFormContext } from '../ScenarioFormContext'

jest.mock('pages/common/components/accordion/SortableAccordion', () => ({
    __esModule: true,
    default: ({
        children,
        onReorder,
        onChange,
    }: {
        children: React.ReactNode
        onReorder: (keys: string[]) => void
        onChange?: (nextKey: string | null) => void
    }) => (
        <div>
            {children}
            <button
                onClick={() => onReorder(['reasonOther', 'reasonCancelOrder'])}
            >
                Reorder
            </button>
            <button onClick={() => onChange?.('reasonCancelOrder')}>
                Expand reasonCancelOrder
            </button>
            <button onClick={() => onChange?.(null)}>Collapse</button>
        </div>
    ),
}))

jest.mock('pages/common/components/accordion/SortableAccordionItem', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('../reasonEditor/ScenarioReasonItem', () => ({
    ScenarioReasonItem: ({
        value,
        onChange,
        onDelete,
    }: {
        value: ReportIssueCaseReason
        onChange: (next: ReportIssueCaseReason) => void
        onDelete: (key: string) => void
    }) => (
        <div>
            <span>{value.reasonKey}</span>
            <button onClick={() => onDelete(value.reasonKey)}>
                Delete {value.reasonKey}
            </button>
            <button
                onClick={() =>
                    onChange({
                        ...value,
                        action: {
                            type: 'automated_response',
                            responseMessageContent: {
                                html: '<p>Updated</p>',
                                text: 'Updated',
                            },
                            showHelpfulPrompt: false,
                        },
                    })
                }
            >
                Change {value.reasonKey}
            </button>
        </div>
    ),
}))

jest.mock('pages/common/components/dropdown/Dropdown', () => ({
    __esModule: true,
    default: ({
        isOpen,
        children,
    }: {
        isOpen: boolean
        children: React.ReactNode
    }) => (isOpen ? <div>{children}</div> : null),
}))

jest.mock('pages/common/components/dropdown/DropdownBody', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownSearch', () => ({
    __esModule: true,
    default: () => <input placeholder="Search" />,
}))

jest.mock('pages/common/components/dropdown/DropdownSection', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownItem', () => ({
    __esModule: true,
    default: ({
        option,
        onClick,
    }: {
        option: { label: string; value: string }
        onClick: (value: string) => void
    }) => <button onClick={() => onClick(option.value)}>{option.label}</button>,
}))

const noopContext = { setError: jest.fn() }

const renderEditor = (
    value: ReportIssueCaseReason[],
    onChange = jest.fn(),
    onExpandedReasonChange?: (reasonKey: string | null) => void,
) =>
    render(
        <ScenarioFormContext.Provider value={noopContext}>
            <ScenarioReasonEditor
                value={value}
                onChange={onChange}
                onExpandedReasonChange={onExpandedReasonChange}
            />
        </ScenarioFormContext.Provider>,
    )

describe('ScenarioReasonEditor', () => {
    it('should render the Add Option button', () => {
        renderEditor([])

        expect(
            screen.getByRole('button', { name: 'Add Option' }),
        ).toBeInTheDocument()
    })

    it('should open the reasons dropdown when clicking Add Option', async () => {
        const user = userEvent.setup()
        renderEditor([])

        await user.click(screen.getByRole('button', { name: 'Add Option' }))

        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
    })

    it('should call onChange with the new reason on selection', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderEditor([], onChange)

        await user.click(screen.getByRole('button', { name: 'Add Option' }))
        await user.click(screen.getByRole('button', { name: 'Other' }))

        expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ reasonKey: 'reasonOther' }),
            ]),
        )
    })

    it('should render existing reasons', () => {
        renderEditor([
            {
                reasonKey: 'reasonCancelOrder',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
        ])

        expect(screen.getByText('reasonCancelOrder')).toBeInTheDocument()
    })

    it('should call onChange without the deleted reason on delete', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const reasons: ReportIssueCaseReason[] = [
            {
                reasonKey: 'reasonCancelOrder',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
            {
                reasonKey: 'reasonOther',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
        ]

        renderEditor(reasons, onChange)

        await user.click(
            screen.getByRole('button', { name: 'Delete reasonCancelOrder' }),
        )

        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({ reasonKey: 'reasonOther' }),
        ])
    })

    it('should not add a reason that is already selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const reasons: ReportIssueCaseReason[] = [
            {
                reasonKey: 'reasonOther',
                action: {
                    type: 'automated_response',
                    responseMessageContent: {
                        html: '<div>How can we help?</div>',
                        text: 'How can we help?',
                    },
                    showHelpfulPrompt: false,
                },
            },
        ]

        renderEditor(reasons, onChange)

        await user.click(screen.getByRole('button', { name: 'Add Option' }))
        await user.click(screen.getByRole('button', { name: 'Other' }))

        expect(onChange).not.toHaveBeenCalled()
    })

    it('should call onChange with reordered reasons', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const reasons: ReportIssueCaseReason[] = [
            {
                reasonKey: 'reasonCancelOrder',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
            {
                reasonKey: 'reasonOther',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
        ]

        renderEditor(reasons, onChange)

        await user.click(screen.getByRole('button', { name: 'Reorder' }))

        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({ reasonKey: 'reasonOther' }),
            expect.objectContaining({ reasonKey: 'reasonCancelOrder' }),
        ])
    })

    it('should call onExpandedReasonChange when a reason is expanded and collapsed', async () => {
        const user = userEvent.setup()
        const onExpandedReasonChange = jest.fn()
        const reasons: ReportIssueCaseReason[] = [
            {
                reasonKey: 'reasonCancelOrder',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
        ]

        renderEditor(reasons, jest.fn(), onExpandedReasonChange)

        await user.click(
            screen.getByRole('button', { name: 'Expand reasonCancelOrder' }),
        )
        expect(onExpandedReasonChange).toHaveBeenLastCalledWith(
            'reasonCancelOrder',
        )

        await user.click(screen.getByRole('button', { name: 'Collapse' }))
        expect(onExpandedReasonChange).toHaveBeenLastCalledWith(null)
    })

    it('should call onChange with updated reason when item changes', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const reasons: ReportIssueCaseReason[] = [
            {
                reasonKey: 'reasonCancelOrder',
                action: {
                    type: 'automated_response',
                    responseMessageContent: { html: '', text: '' },
                    showHelpfulPrompt: false,
                },
            },
        ]

        renderEditor(reasons, onChange)

        await user.click(
            screen.getByRole('button', {
                name: 'Change reasonCancelOrder',
            }),
        )

        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({
                reasonKey: 'reasonCancelOrder',
                action: expect.objectContaining({
                    responseMessageContent: expect.objectContaining({
                        text: 'Updated',
                    }),
                }),
            }),
        ])
    })
})
