import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { FeedbackExecutionsItem } from '@gorgias/knowledge-service-types'

import { AIAgentFeedbackReasonSection } from '../AIAgentTicketLevelFeedback/AIAgentFeedbackReasonSection'
import { AiAgentBadInteractionReason } from '../types'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useDebouncedCallback: jest.fn((callback) => {
        return callback
    }),
}))

jest.mock('pages/common/forms/input/SelectInputBox', () => {
    return function MockSelectInputBox({
        id,
        className,
        inputClassName,
        placeholder,
        onClick,
    }: any) {
        return (
            <div
                id={id}
                className={`${className || ''} ${inputClassName || ''}`}
                onClick={onClick}
                data-testid="select-input-box"
            >
                {placeholder}
            </div>
        )
    }
})

jest.mock('custom-fields/components/MultiLevelSelect', () => {
    return function MockMultiLevelSelect({
        onChange,
        value,
        CustomInput,
    }: any) {
        return (
            <div data-testid="multi-level-select">
                {CustomInput && <CustomInput onFocus={() => {}} />}
                <select
                    data-testid="select"
                    multiple
                    value={value}
                    onChange={(e) => {
                        const selectedValues = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                        )
                        onChange(selectedValues)
                    }}
                >
                    <option value="Wrong knowledge used">
                        Wrong knowledge used
                    </option>
                    <option value="Didn't follow knowledge content">
                        Didn't follow knowledge content
                    </option>
                    <option value="Action not performed">
                        Action not performed
                    </option>
                    <option value="Tone of voice not aligned">
                        Tone of voice not aligned
                    </option>
                    <option value="Hallucination">Hallucination</option>
                    <option value="Repetitive messages">
                        Repetitive messages
                    </option>
                    <option value="Other (explain in additional feedback)">
                        Other
                    </option>
                </select>
            </div>
        )
    }
})

describe('AIAgentFeedbackReasonSection', () => {
    const defaultProps = {
        handleFeedbackChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the reason section with header and select input', () => {
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        expect(screen.getByText('What went wrong?')).toBeInTheDocument()
        expect(screen.getByTestId('multi-level-select')).toBeInTheDocument()
        expect(screen.getByText('Select all that apply')).toBeInTheDocument()
    })

    it('should initialize with empty values when no badInteractionReasons provided', () => {
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        expect(screen.getByText('Select all that apply')).toBeInTheDocument()
    })

    it('should initialize with values from badInteractionReasons prop', () => {
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
            {
                id: 2,
                feedbackValue: AiAgentBadInteractionReason.HALLUCINATION,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const expectedText = 'Wrong knowledge used, Hallucination'
        expect(screen.getByText(expectedText)).toBeInTheDocument()
    })

    it('should show selected values in placeholder when values are selected', () => {
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        expect(
            screen.getAllByText('Wrong knowledge used')[0],
        ).toBeInTheDocument()
    })

    it('should handle single value selection and call handleFeedbackChange', async () => {
        const user = userEvent.setup()
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        const select = screen.getByTestId('select')

        await act(async () => {
            await user.selectOptions(select, ['Wrong knowledge used'])
        })

        expect(defaultProps.handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: 'WRONG_KNOWLEDGE',
            },
        ])
    })

    it('should handle multiple value selection', async () => {
        const user = userEvent.setup()
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        const select = screen.getByTestId('select')

        await act(async () => {
            await user.selectOptions(select, [
                'Wrong knowledge used',
                'Hallucination',
            ])
        })

        expect(defaultProps.handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: 'WRONG_KNOWLEDGE',
            },
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: 'HALLUCINATION',
            },
        ])
    })

    it('should handle removing existing selections', async () => {
        const user = userEvent.setup()
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const select = screen.getByTestId('select')

        await act(async () => {
            await user.deselectOptions(select, ['Wrong knowledge used'])
        })

        expect(defaultProps.handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: null,
                id: 1,
            },
        ])
    })

    it('should handle adding new selection when existing selections are present', async () => {
        const user = userEvent.setup()
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const select = screen.getByTestId('select')

        await act(async () => {
            await user.selectOptions(select, ['Hallucination'])
        })

        expect(defaultProps.handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: 'HALLUCINATION',
            },
        ])
    })

    it('should store pending choices when loading mutations are present', async () => {
        const user = userEvent.setup()
        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                loadingMutations={['mutation1']}
            />,
        )

        const select = screen.getByTestId('select')

        await act(async () => {
            await user.selectOptions(select, ['Wrong knowledge used'])
        })

        expect(defaultProps.handleFeedbackChange).not.toHaveBeenCalled()
    })

    it('should process pending choices when loading mutations clear', async () => {
        const { rerender } = render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                loadingMutations={['mutation1']}
            />,
        )

        const select = screen.getByTestId('select')

        await act(async () => {
            const user = userEvent.setup()
            await user.selectOptions(select, ['Wrong knowledge used'])
        })

        act(() => {
            rerender(
                <AIAgentFeedbackReasonSection
                    {...defaultProps}
                    loadingMutations={[]}
                />,
            )
        })

        await waitFor(() => {
            expect(defaultProps.handleFeedbackChange).toHaveBeenCalled()
        })
    })

    it('should not update values when loading mutations are present and there are no pending choices', () => {
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        const { rerender } = render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
                loadingMutations={['mutation1']}
            />,
        )

        const newBadInteractionReasons = [...badInteractionReasons]
        newBadInteractionReasons[0].feedbackValue =
            AiAgentBadInteractionReason.HALLUCINATION

        act(() => {
            rerender(
                <AIAgentFeedbackReasonSection
                    {...defaultProps}
                    badInteractionReasons={newBadInteractionReasons}
                    loadingMutations={['mutation1']}
                />,
            )
        })

        expect(defaultProps.handleFeedbackChange).not.toHaveBeenCalled()
    })

    it('should render tooltip when values are selected', () => {
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        expect(
            document.getElementById('ai-agent-bad-interaction-reason-select'),
        ).toBeInTheDocument()
    })

    it('should handle non-array value in handleBadInteractionReasonChange', async () => {
        const user = userEvent.setup()
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        const select = screen.getByTestId('select')

        await act(async () => {
            await user.selectOptions(select, 'Wrong knowledge used')
        })

        expect(defaultProps.handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: 'WRONG_KNOWLEDGE',
            },
        ])
    })

    it('should return early from useEffect when pendingChoicesRef is not null', () => {
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        const { rerender } = render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
                loadingMutations={['mutation1']}
            />,
        )

        const select = screen.getByTestId('select')
        act(() => {
            const event = new Event('change', { bubbles: true })
            Object.defineProperty(event, 'target', {
                value: {
                    selectedOptions: [{ value: 'Hallucination' }],
                },
            })
            select.dispatchEvent(event)
        })

        const newBadInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                ...badInteractionReasons[0],
                feedbackValue: AiAgentBadInteractionReason.HALLUCINATION,
                feedbackType: 'TICKET_FREEFORM',
            },
        ]

        act(() => {
            rerender(
                <AIAgentFeedbackReasonSection
                    {...defaultProps}
                    badInteractionReasons={newBadInteractionReasons}
                    loadingMutations={[]}
                />,
            )
        })

        expect(screen.getByTestId('multi-level-select')).toBeInTheDocument()
    })

    it('should apply selectInputBoxWithValues className when values exist', () => {
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const selectInputBox = document.getElementById(
            'ai-agent-bad-interaction-reason-select',
        )
        expect(selectInputBox).toHaveClass('selectInputBoxWithValues')
    })

    it('should not apply selectInputBoxWithValues className when values are empty', () => {
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        const selectInputBox = document.getElementById(
            'ai-agent-bad-interaction-reason-select',
        )
        expect(selectInputBox).not.toHaveClass('selectInputBoxWithValues')
    })
})
