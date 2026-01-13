import * as hooks from '@repo/hooks'
import { act, fireEvent, render, screen } from '@testing-library/react'

import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldDescription,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldPercentage,
    KnowledgeEditorSidePanelFieldSourceDocument,
    KnowledgeEditorSidePanelFieldStatus,
    KnowledgeEditorSidePanelFieldURL,
} from './KnowledgeEditorSidePanelCommonFields'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useCopyToClipboard: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Icon: jest.fn(({ name }) => <span data-testid={`icon-${name}`} />),
}))

describe('KnowledgeEditorSidePanelFieldKnowledgeType', () => {
    it('renders type', () => {
        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="help-center-article" />,
        )
        expect(screen.getByText('Help Center article')).toBeInTheDocument()

        render(<KnowledgeEditorSidePanelFieldKnowledgeType type="guidance" />)
        expect(screen.getByText('Guidance')).toBeInTheDocument()

        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="document-snippet" />,
        )
        expect(screen.getByText('Document')).toBeInTheDocument()

        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="url-snippet" />,
        )
        expect(screen.getByText('URL')).toBeInTheDocument()

        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="store-snippet" />,
        )
        expect(screen.getByText('Store website')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldAIAgentStatus', () => {
    it('renders enabled', () => {
        const onChange = jest.fn()

        render(
            <KnowledgeEditorSidePanelFieldAIAgentStatus
                checked={true}
                onChange={onChange}
            />,
        )
        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByRole('switch')).toBeChecked()

        fireEvent.click(screen.getByRole('switch'))
        expect(onChange).toHaveBeenCalledWith(false)
    })
    it('renders disabled', () => {
        render(<KnowledgeEditorSidePanelFieldAIAgentStatus checked={false} />)
        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByRole('switch')).not.toBeChecked()
    })
})

describe('KnowledgeEditorSidePanelFieldDateField', () => {
    it('renders date', () => {
        render(
            <KnowledgeEditorSidePanelFieldDateField
                date={new Date('2025-10-06')}
            />,
        )
        expect(screen.getByText('October 6, 2025')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldURL', () => {
    const mockCopyToClipboard = jest.fn()
    let mockCopyState: { value?: string }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        mockCopyState = {}
        ;(hooks.useCopyToClipboard as jest.Mock).mockReturnValue([
            mockCopyState,
            mockCopyToClipboard,
        ])
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('renders URL', () => {
        render(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )
        expect(screen.getByText('https://www.google.com')).toBeInTheDocument()
    })

    it('shows copy icon by default', () => {
        render(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        expect(screen.getByTestId('icon-copy')).toBeInTheDocument()
    })

    it('shows checkmark icon after successful copy', () => {
        const { rerender } = render(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        expect(screen.getByTestId('icon-copy')).toBeInTheDocument()

        // Simulate successful copy by returning a new object with value
        act(() => {
            const newMockCopyState = { value: 'https://www.google.com' }
            ;(hooks.useCopyToClipboard as jest.Mock).mockReturnValue([
                newMockCopyState,
                mockCopyToClipboard,
            ])
        })

        rerender(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        // Should show checkmark icon
        expect(screen.getByTestId('icon-check-all')).toBeInTheDocument()
        expect(screen.queryByTestId('icon-copy')).not.toBeInTheDocument()
    })

    it('reverts to copy icon after 3 seconds', () => {
        const { rerender } = render(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        // Simulate successful copy by returning a new object
        act(() => {
            const newMockCopyState = { value: 'https://www.google.com' }
            ;(hooks.useCopyToClipboard as jest.Mock).mockReturnValue([
                newMockCopyState,
                mockCopyToClipboard,
            ])
        })

        rerender(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        // Should show checkmark
        expect(screen.getByTestId('icon-check-all')).toBeInTheDocument()

        // Fast-forward time by 3 seconds
        act(() => {
            jest.advanceTimersByTime(3000)
        })

        // Should revert to copy icon
        expect(screen.getByTestId('icon-copy')).toBeInTheDocument()
        expect(screen.queryByTestId('icon-check-all')).not.toBeInTheDocument()
    })

    it('resets timer on multiple rapid clicks', () => {
        const { rerender } = render(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        // First copy - return new object
        act(() => {
            const newMockCopyState = { value: 'https://www.google.com' }
            ;(hooks.useCopyToClipboard as jest.Mock).mockReturnValue([
                newMockCopyState,
                mockCopyToClipboard,
            ])
        })

        rerender(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        // Should show checkmark
        expect(screen.getByTestId('icon-check-all')).toBeInTheDocument()

        // Advance time by 2 seconds (not enough to reset)
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Still showing checkmark
        expect(screen.getByTestId('icon-check-all')).toBeInTheDocument()

        // Second copy - return another new object with different value
        act(() => {
            const newMockCopyState2 = { value: 'https://www.google.com-2' }
            ;(hooks.useCopyToClipboard as jest.Mock).mockReturnValue([
                newMockCopyState2,
                mockCopyToClipboard,
            ])
        })

        rerender(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )

        // Should still show checkmark
        expect(screen.getByTestId('icon-check-all')).toBeInTheDocument()

        // Advance time by 2 more seconds (total 4 seconds from first copy, 2 from second)
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Should still show checkmark because timer was reset
        expect(screen.getByTestId('icon-check-all')).toBeInTheDocument()

        // Advance time by 1 more second (3 seconds from second copy)
        act(() => {
            jest.advanceTimersByTime(1000)
        })

        // Now should revert to copy icon
        expect(screen.getByTestId('icon-copy')).toBeInTheDocument()
        expect(screen.queryByTestId('icon-check-all')).not.toBeInTheDocument()
    })

    it('handles empty URL', () => {
        const { container } = render(<KnowledgeEditorSidePanelFieldURL />)

        expect(container.textContent).toBe('-')
        expect(container.querySelector('.copyButton')).not.toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldDescription', () => {
    it('renders description', () => {
        render(
            <KnowledgeEditorSidePanelFieldDescription description="Description" />,
        )
        expect(screen.getByText('Description')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldPercentage', () => {
    it('renders percentage', () => {
        render(<KnowledgeEditorSidePanelFieldPercentage percentage={0.5} />)
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('renders percentage with decimal', () => {
        render(<KnowledgeEditorSidePanelFieldPercentage percentage={0.123} />)
        expect(screen.getByText('12.3%')).toBeInTheDocument()
    })

    it('renders dash when percentage is undefined', () => {
        const { container } = render(
            <KnowledgeEditorSidePanelFieldPercentage percentage={undefined} />,
        )
        expect(container.textContent).toBe('-')
    })

    it('renders dash when percentage is 0', () => {
        const { container } = render(
            <KnowledgeEditorSidePanelFieldPercentage percentage={0} />,
        )
        expect(container.textContent).toBe('-')
    })

    it('renders 100% correctly', () => {
        render(<KnowledgeEditorSidePanelFieldPercentage percentage={1} />)
        expect(screen.getByText('100%')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldStatus', () => {
    it('renders Draft status with grey color', () => {
        render(<KnowledgeEditorSidePanelFieldStatus isDraft={true} />)
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders Published status with green color', () => {
        render(<KnowledgeEditorSidePanelFieldStatus isDraft={false} />)
        expect(screen.getByText('Published')).toBeInTheDocument()
    })

    it('renders dash when mode is create', () => {
        const { container } = render(
            <KnowledgeEditorSidePanelFieldStatus
                isDraft={false}
                mode="create"
            />,
        )
        expect(container.textContent).toBe('-')
        expect(screen.queryByText('Draft')).not.toBeInTheDocument()
        expect(screen.queryByText('Published')).not.toBeInTheDocument()
    })

    it('renders dash when mode is create regardless of isDraft value', () => {
        const { container } = render(
            <KnowledgeEditorSidePanelFieldStatus
                isDraft={true}
                mode="create"
            />,
        )
        expect(container.textContent).toBe('-')
        expect(screen.queryByText('Draft')).not.toBeInTheDocument()
        expect(screen.queryByText('Published')).not.toBeInTheDocument()
    })

    it('renders Draft when mode is edit and isDraft is true', () => {
        render(
            <KnowledgeEditorSidePanelFieldStatus isDraft={true} mode="edit" />,
        )
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders Published when mode is edit and isDraft is false', () => {
        render(
            <KnowledgeEditorSidePanelFieldStatus isDraft={false} mode="edit" />,
        )
        expect(screen.getByText('Published')).toBeInTheDocument()
    })

    it('renders Draft when mode is read and isDraft is true', () => {
        render(
            <KnowledgeEditorSidePanelFieldStatus isDraft={true} mode="read" />,
        )
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders Published when mode is read and isDraft is false', () => {
        render(
            <KnowledgeEditorSidePanelFieldStatus isDraft={false} mode="read" />,
        )
        expect(screen.getByText('Published')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldSourceDocument', () => {
    it('renders document link with label', () => {
        const sourceDocument = {
            label: 'test-document.pdf',
            downloadUrl: 'https://example.com/test-document.pdf',
        }

        render(
            <KnowledgeEditorSidePanelFieldSourceDocument
                sourceDocument={sourceDocument}
            />,
        )

        expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute(
            'href',
            'https://example.com/test-document.pdf',
        )
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders download icon', () => {
        const sourceDocument = {
            label: 'test-document.pdf',
            downloadUrl: 'https://example.com/test-document.pdf',
        }

        render(
            <KnowledgeEditorSidePanelFieldSourceDocument
                sourceDocument={sourceDocument}
            />,
        )

        expect(screen.getByTestId('icon-download')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldDateField', () => {
    it('renders dash when date is undefined', () => {
        const { container } = render(
            <KnowledgeEditorSidePanelFieldDateField date={undefined} />,
        )
        expect(container.textContent).toBe('-')
    })
})

describe('KnowledgeEditorSidePanelFieldAIAgentStatus extended', () => {
    it('renders with disabled class when isDisabled is true', () => {
        render(
            <KnowledgeEditorSidePanelFieldAIAgentStatus
                checked={true}
                onChange={jest.fn()}
                isDisabled={true}
            />,
        )
        expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('renders with disabled class when onChange is not provided', () => {
        render(<KnowledgeEditorSidePanelFieldAIAgentStatus checked={true} />)
        expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('renders with className when provided', () => {
        render(
            <KnowledgeEditorSidePanelFieldAIAgentStatus
                checked={true}
                onChange={jest.fn()}
                className="custom-class"
            />,
        )
        expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    describe('Multi-language info icon', () => {
        it('does not render info icon by default', () => {
            render(
                <KnowledgeEditorSidePanelFieldAIAgentStatus
                    checked={true}
                    onChange={jest.fn()}
                />,
            )
            expect(screen.queryByTestId('icon-info')).not.toBeInTheDocument()
        })

        it('does not render info icon when showMultiLanguageInfo is false', () => {
            render(
                <KnowledgeEditorSidePanelFieldAIAgentStatus
                    checked={true}
                    onChange={jest.fn()}
                    showMultiLanguageInfo={false}
                    multiLanguageTooltip="Test tooltip"
                />,
            )
            expect(screen.queryByTestId('icon-info')).not.toBeInTheDocument()
        })

        it('does not render info icon when multiLanguageTooltip is undefined', () => {
            render(
                <KnowledgeEditorSidePanelFieldAIAgentStatus
                    checked={true}
                    onChange={jest.fn()}
                    showMultiLanguageInfo={true}
                />,
            )
            expect(screen.queryByTestId('icon-info')).not.toBeInTheDocument()
        })

        it('renders info icon when showMultiLanguageInfo is true and multiLanguageTooltip is provided', () => {
            render(
                <KnowledgeEditorSidePanelFieldAIAgentStatus
                    checked={true}
                    onChange={jest.fn()}
                    showMultiLanguageInfo={true}
                    multiLanguageTooltip="You're viewing the default-language version of this article: English (US). AI Agent only uses this default version."
                />,
            )
            expect(screen.getByTestId('icon-info')).toBeInTheDocument()
        })

        it('renders both toggle and info icon when multi-language is enabled', () => {
            render(
                <KnowledgeEditorSidePanelFieldAIAgentStatus
                    checked={true}
                    onChange={jest.fn()}
                    showMultiLanguageInfo={true}
                    multiLanguageTooltip="Test tooltip"
                />,
            )
            expect(screen.getByRole('switch')).toBeInTheDocument()
            expect(screen.getByTestId('icon-info')).toBeInTheDocument()
        })
    })
})
