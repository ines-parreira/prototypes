import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AddStepButton } from '../AddStepButton'
import { AddStepMenuItem } from '../AddStepMenuItem'

describe('AddStepButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the add button', () => {
        render(
            <AddStepButton>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })
        expect(button).toBeInTheDocument()
    })

    it('should add & remove selected class when dropdown is opened & closed', async () => {
        const user = userEvent.setup()
        render(
            <AddStepButton>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })
        expect(button).toHaveClass('selected')

        await act(async () => {
            await user.click(button)
        })
        expect(button).not.toHaveClass('selected')
    })

    it('should render all menu items in dropdown', async () => {
        const user = userEvent.setup()
        render(
            <AddStepButton>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
                <AddStepMenuItem label="Option 2" onClick={jest.fn()} />
                <AddStepMenuItem label="Option 3" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
            expect(screen.getByText('Option 2')).toBeInTheDocument()
            expect(screen.getByText('Option 3')).toBeInTheDocument()
        })
    })

    it('should call onClick handler when menu item is clicked', async () => {
        const user = userEvent.setup()
        const handleClick = jest.fn()

        render(
            <AddStepButton>
                <AddStepMenuItem label="Option 1" onClick={handleClick} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })

        await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })

        await act(async () => {
            await user.click(screen.getByText('Option 1'))
        })

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should close dropdown and remove selected class when menu item is clicked', async () => {
        const user = userEvent.setup()
        const handleClick = jest.fn()

        render(
            <AddStepButton>
                <AddStepMenuItem label="Option 1" onClick={handleClick} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })

        waitFor(() => {
            expect(button).toHaveClass('selected')
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })

        await act(async () => {
            await user.click(screen.getByText('Option 1'))
        })

        await waitFor(() => {
            expect(button).not.toHaveClass('selected')
            expect(screen.queryByText('Option 1')).toBeNull()
        })
    })

    it('should not render dropdown when no children are provided', async () => {
        const user = userEvent.setup()
        render(<AddStepButton />)

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })

        await waitFor(() => {
            expect(
                screen.queryByTestId('dropdown-menu'),
            ).not.toBeInTheDocument()
        })
    })

    it('should work with custom children besides AddButtonMenuItem', async () => {
        const user = userEvent.setup()
        render(
            <AddStepButton>
                <div>Custom content</div>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })

        await waitFor(() => {
            expect(screen.getByText('Custom content')).toBeInTheDocument()
            expect(screen.getByText('Option 1')).toBeInTheDocument()
        })
    })

    it('should be enabled when isDisabled is false', () => {
        render(
            <AddStepButton isDisabled={false}>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })
        expect(button).not.toBeDisabled()
    })

    it('should be disabled when isDisabled is true', () => {
        render(
            <AddStepButton isDisabled={true}>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })
        expect(button).toBeDisabled()
    })

    it('should not open dropdown when clicked while disabled', async () => {
        const user = userEvent.setup()
        render(
            <AddStepButton isDisabled={true}>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })

        await act(async () => {
            await user.click(button)
        })

        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
        expect(button).not.toHaveClass('selected')
    })

    it('should be enabled by default when isDisabled is not provided', () => {
        render(
            <AddStepButton>
                <AddStepMenuItem label="Option 1" onClick={jest.fn()} />
            </AddStepButton>,
        )

        const button = screen.getByRole('button', { name: /add/i })
        expect(button).not.toBeDisabled()
    })
})
