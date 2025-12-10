import * as hooks from '@repo/hooks'
import { act, fireEvent, render, screen } from '@testing-library/react'

import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldDescription,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldPercentage,
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
})
