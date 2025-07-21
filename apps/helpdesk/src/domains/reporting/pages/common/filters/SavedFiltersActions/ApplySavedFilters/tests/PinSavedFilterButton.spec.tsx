import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PinSavedFilterButton } from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/PinSavedFilterButton'

describe('PinSavedFilterButton', () => {
    const defaultProps = {
        savedFilterId: 123,
        onPin: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render with required props', () => {
            render(<PinSavedFilterButton {...defaultProps} />)

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })

        it('should render with push_pin icon', () => {
            render(<PinSavedFilterButton {...defaultProps} />)

            const button = screen.getByRole('button')
            const icon = button.querySelector('.material-icons')
            expect(icon).toHaveTextContent('push_pin')
        })
    })

    describe('pinned state', () => {
        it('should show unpinned state by default', () => {
            render(<PinSavedFilterButton {...defaultProps} />)

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-pressed', 'false')
            expect(button).toHaveAttribute('data-state', 'off')

            const icon = button.querySelector('i')
            expect(icon).toHaveClass('material-icons-outlined')
        })

        it('should show pinned state when isPinned is true', () => {
            render(<PinSavedFilterButton {...defaultProps} isPinned={true} />)

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-pressed', 'true')
            expect(button).toHaveAttribute('data-state', 'on')

            const icon = button.querySelector('.material-icons')
            expect(icon).toHaveClass('material-icons-solid')
        })

        it('should show unpinned state when isPinned is false', () => {
            render(<PinSavedFilterButton {...defaultProps} isPinned={false} />)

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-pressed', 'false')
            expect(button).toHaveAttribute('data-state', 'off')

            const icon = button.querySelector('.material-icons')
            expect(icon).toHaveClass('material-icons-outlined')
        })
    })

    describe('click behavior', () => {
        it('should call onPin with savedFilterId when clicked', async () => {
            const user = userEvent.setup()
            const onPin = jest.fn()

            render(<PinSavedFilterButton {...defaultProps} onPin={onPin} />)

            const button = screen.getByRole('button')
            await user.click(button)

            expect(onPin).toHaveBeenCalledWith(123)
            expect(onPin).toHaveBeenCalledTimes(1)
        })

        it('should call optional onClick when provided', async () => {
            const user = userEvent.setup()
            const onPin = jest.fn()
            const onClick = jest.fn()

            render(
                <PinSavedFilterButton
                    {...defaultProps}
                    onPin={onPin}
                    onClick={onClick}
                />,
            )

            const button = screen.getByRole('button')
            await user.click(button)

            expect(onPin).toHaveBeenCalledWith(123)
            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('should call both onPin and onClick in correct order', async () => {
            const user = userEvent.setup()
            const callOrder: string[] = []

            const onPin = jest.fn(() => callOrder.push('onPin'))
            const onClick = jest.fn(() => callOrder.push('onClick'))

            render(
                <PinSavedFilterButton
                    {...defaultProps}
                    onPin={onPin}
                    onClick={onClick}
                />,
            )

            const button = screen.getByRole('button')
            await user.click(button)

            expect(callOrder).toEqual(['onPin', 'onClick'])
        })

        it('should work without onClick prop', async () => {
            const user = userEvent.setup()
            const onPin = jest.fn()

            render(<PinSavedFilterButton {...defaultProps} onPin={onPin} />)

            const button = screen.getByRole('button')
            await user.click(button)

            expect(onPin).toHaveBeenCalledWith(123)
        })
    })

    describe('additional props', () => {
        it('should pass through additional IconButton props', () => {
            render(
                <PinSavedFilterButton
                    {...defaultProps}
                    isDisabled={true}
                    className="custom-class"
                />,
            )

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-disabled', 'true')
            expect(button).toHaveClass('custom-class')
        })

        it('should not override core props with additional props', () => {
            render(
                <PinSavedFilterButton
                    {...defaultProps}
                    // @ts-expect-error - testing that core props cannot be overridden
                    icon="different_icon"
                />,
            )

            const button = screen.getByRole('button')
            const icon = button.querySelector('.material-icons')
            expect(icon).toHaveTextContent('push_pin')
        })
    })

    describe('accessibility', () => {
        it('should have correct role', () => {
            render(<PinSavedFilterButton {...defaultProps} />)

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })

        it('should be keyboard accessible', async () => {
            const user = userEvent.setup()
            const onPin = jest.fn()

            render(<PinSavedFilterButton {...defaultProps} onPin={onPin} />)

            const button = screen.getByRole('button')
            button.focus()

            await user.keyboard('{Enter}')
            expect(onPin).toHaveBeenCalledWith(123)

            await user.keyboard(' ')
            expect(onPin).toHaveBeenCalledTimes(2)
        })

        it('should have appropriate aria-pressed attribute', () => {
            const { rerender } = render(
                <PinSavedFilterButton {...defaultProps} />,
            )

            let button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-pressed', 'false')

            rerender(<PinSavedFilterButton {...defaultProps} isPinned={true} />)
            button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-pressed', 'true')
        })
    })
})
