import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PlaygroundActionsToggle from './PlaygroundActionsToggle'

jest.mock('../PlaygroundActionsModal/PlaygroundActionsModal', () => {
    return function MockPlaygroundActionsModal({
        isOpen,
        onClose,
        onConfirm,
    }: any) {
        if (!isOpen) return null
        return (
            <div data-testid="playground-actions-modal">
                <button onClick={onClose}>Close Modal</button>
                <button onClick={onConfirm}>Confirm Modal</button>
            </div>
        )
    }
})

describe('PlaygroundActionsToggle', () => {
    const defaultProps = {
        value: false,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render toggle with disabled state message when value is false', () => {
        render(<PlaygroundActionsToggle {...defaultProps} />)

        expect(
            screen.getByText(
                'Actions disabled - no changes will be made to live data',
            ),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('switch')
        expect(toggle).toBeInTheDocument()
        expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should render toggle with enabled state message when value is true', () => {
        render(<PlaygroundActionsToggle {...defaultProps} value={true} />)

        expect(
            screen.getByText('Actions enabled - changes will affect live data'),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('switch')
        expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('should display warning icon when actions are enabled', () => {
        render(<PlaygroundActionsToggle {...defaultProps} value={true} />)

        const warningIcon = screen.getByAltText('warning')
        expect(warningIcon).toBeInTheDocument()
        expect(warningIcon).toHaveAttribute('src', 'test-file-stub')
    })

    it('should display tooltip on warning icon hover when actions are enabled', async () => {
        render(<PlaygroundActionsToggle {...defaultProps} value={true} />)

        const warningIcon = screen.getByAltText('warning')

        await act(async () => {
            await userEvent.hover(warningIcon)
        })

        await waitFor(() => {
            expect(
                screen.getByText(/changes will affect live data/i),
            ).toBeInTheDocument()
        })
    })

    it('should open modal when toggling from disabled to enabled', async () => {
        render(<PlaygroundActionsToggle {...defaultProps} />)

        const toggle = screen.getByRole('switch')
        await act(async () => {
            await userEvent.click(toggle)
        })

        await waitFor(() => {
            expect(
                screen.getByTestId('playground-actions-modal'),
            ).toBeInTheDocument()
        })

        expect(defaultProps.onChange).not.toHaveBeenCalled()
    })

    it('should call onChange(false) directly when toggling from enabled to disabled', async () => {
        render(<PlaygroundActionsToggle {...defaultProps} value={true} />)

        const toggle = screen.getByRole('switch')
        await act(async () => {
            await userEvent.click(toggle)
        })

        await waitFor(() => {
            expect(defaultProps.onChange).toHaveBeenCalledWith(false)
        })

        expect(
            screen.queryByTestId('playground-actions-modal'),
        ).not.toBeInTheDocument()
    })

    it('should close modal when cancel is clicked', async () => {
        render(<PlaygroundActionsToggle {...defaultProps} />)

        const toggle = screen.getByRole('switch')
        await act(async () => {
            await userEvent.click(toggle)
        })

        await waitFor(() => {
            expect(
                screen.getByTestId('playground-actions-modal'),
            ).toBeInTheDocument()
        })

        const closeButton = screen.getByText('Close Modal')
        await act(async () => {
            await userEvent.click(closeButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByTestId('playground-actions-modal'),
            ).not.toBeInTheDocument()
        })

        expect(defaultProps.onChange).not.toHaveBeenCalled()
    })

    it('should call onChange(true) when modal is confirmed', async () => {
        render(<PlaygroundActionsToggle {...defaultProps} />)

        const toggle = screen.getByRole('switch')
        await act(async () => {
            await userEvent.click(toggle)
        })

        const confirmButton = screen.getByText('Confirm Modal')
        await act(async () => {
            await userEvent.click(confirmButton)
        })

        await waitFor(() => {
            expect(defaultProps.onChange).toHaveBeenCalledWith(true)
        })

        await waitFor(() => {
            expect(
                screen.queryByTestId('playground-actions-modal'),
            ).not.toBeInTheDocument()
        })
    })

    it('should display info icon', () => {
        render(<PlaygroundActionsToggle {...defaultProps} />)

        const infoIcon = screen.getByText('info')
        expect(infoIcon).toBeInTheDocument()
        expect(infoIcon).toHaveClass('material-icons-outlined')
    })

    it('should maintain correct toggle state based on value prop', () => {
        const { rerender } = render(
            <PlaygroundActionsToggle {...defaultProps} />,
        )

        let toggle = screen.getByRole('switch')
        expect(toggle).toHaveAttribute('aria-checked', 'false')

        act(() => {
            rerender(<PlaygroundActionsToggle {...defaultProps} value={true} />)
        })

        toggle = screen.getByRole('switch')
        expect(toggle).toHaveAttribute('aria-checked', 'true')

        act(() => {
            rerender(
                <PlaygroundActionsToggle {...defaultProps} value={false} />,
            )
        })

        toggle = screen.getByRole('switch')
        expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should have correct CSS classes applied', () => {
        const { container } = render(
            <PlaygroundActionsToggle {...defaultProps} />,
        )

        const toggleContainer = container.querySelector(
            '.playgroundActionsToggle',
        )
        expect(toggleContainer).toBeInTheDocument()

        const warningText = container.querySelector('.warningText')
        expect(warningText).toBeInTheDocument()

        const infoIcon = container.querySelector('.infoIcon')
        expect(infoIcon).toBeInTheDocument()
    })

    it('should display correct layout for enabled state', () => {
        render(<PlaygroundActionsToggle {...defaultProps} value={true} />)

        const enabledContainer = document.querySelector('.enabledContainer')
        expect(enabledContainer).toBeInTheDocument()

        const warningIcon = document.querySelector('.warningIcon')
        expect(warningIcon).toBeInTheDocument()
    })
})
