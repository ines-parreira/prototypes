import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CollapsibleSection from './CollapsibleSection'

describe('CollapsibleSection', () => {
    const defaultProps = {
        title: 'Test Section',
        isExpanded: false,
        onToggle: jest.fn(),
        children: <div>Test Content</div>,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render title and children when expanded', () => {
        render(<CollapsibleSection {...defaultProps} isExpanded={true} />)

        expect(
            screen.getByRole('button', {
                name: 'Collapse Test Section section',
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render title and children when collapsed', () => {
        render(<CollapsibleSection {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: 'Expand Test Section section' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render caption when provided', () => {
        render(<CollapsibleSection {...defaultProps} caption="Test Caption" />)

        expect(screen.getByText('Test Caption')).toBeInTheDocument()
    })

    it('should not render caption when not provided', () => {
        render(<CollapsibleSection {...defaultProps} />)

        expect(screen.queryByText('Test Caption')).not.toBeInTheDocument()
    })

    it('should call onToggle when header button is clicked', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()

        render(<CollapsibleSection {...defaultProps} onToggle={onToggle} />)

        const button = screen.getByRole('button', {
            name: 'Expand Test Section section',
        })

        await act(() => user.click(button))

        expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('should have correct aria-expanded attribute when expanded', () => {
        render(<CollapsibleSection {...defaultProps} isExpanded={true} />)

        const button = screen.getByRole('button', {
            name: 'Collapse Test Section section',
        })

        expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have correct aria-expanded attribute when collapsed', () => {
        render(<CollapsibleSection {...defaultProps} isExpanded={false} />)

        const button = screen.getByRole('button', {
            name: 'Expand Test Section section',
        })

        expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should apply custom className when provided', () => {
        const { container } = render(
            <CollapsibleSection {...defaultProps} className="custom-class" />,
        )

        expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should render chevron icon', () => {
        render(<CollapsibleSection {...defaultProps} />)

        const button = screen.getByRole('button', {
            name: 'Expand Test Section section',
        })

        expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })

    it('should render complex children content', () => {
        render(
            <CollapsibleSection {...defaultProps}>
                <div>
                    <h3>Nested Title</h3>
                    <p>Nested paragraph</p>
                    <button type="button">Nested button</button>
                </div>
            </CollapsibleSection>,
        )

        expect(screen.getByText('Nested Title')).toBeInTheDocument()
        expect(screen.getByText('Nested paragraph')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Nested button' }),
        ).toBeInTheDocument()
    })

    it('should update aria-label when toggled from collapsed to expanded', () => {
        const { rerender } = render(<CollapsibleSection {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: 'Expand Test Section section' }),
        ).toBeInTheDocument()

        rerender(<CollapsibleSection {...defaultProps} isExpanded={true} />)

        expect(
            screen.getByRole('button', {
                name: 'Collapse Test Section section',
            }),
        ).toBeInTheDocument()
    })

    it('should handle multiple clicks on toggle button', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()

        render(<CollapsibleSection {...defaultProps} onToggle={onToggle} />)

        const button = screen.getByRole('button', {
            name: 'Expand Test Section section',
        })

        await act(async () => {
            await user.click(button)
            await user.click(button)
            await user.click(button)
        })

        expect(onToggle).toHaveBeenCalledTimes(3)
    })
})
