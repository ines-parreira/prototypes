import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StepCardTitleIcon } from '../StepCardTitleIcon'

describe('StepCardTitleIcon', () => {
    it('should render error icon by default', () => {
        render(<StepCardTitleIcon messages={['Error 1']} />)
        expect(
            screen.getByRole('img', { name: 'octagon-warning' }),
        ).toBeInTheDocument()
    })

    it('should render error icon when variant is error', () => {
        render(<StepCardTitleIcon messages={['Error 1']} variant="error" />)
        expect(
            screen.getByRole('img', { name: 'octagon-warning' }),
        ).toBeInTheDocument()
    })

    it('should render warning icon when variant is warning', () => {
        render(<StepCardTitleIcon messages={['Warning 1']} variant="warning" />)
        expect(
            screen.getByRole('img', { name: 'triangle-warning' }),
        ).toBeInTheDocument()
    })

    it('should display custom error title in tooltip', async () => {
        const user = userEvent.setup()
        render(
            <StepCardTitleIcon
                messageTitle="Custom error title"
                messages={['Error 1']}
            />,
        )

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Custom error title')).toBeInTheDocument()
            expect(screen.getByText('Error 1')).toBeInTheDocument()
        })
    })

    it('should not display error title when not provided', async () => {
        const user = userEvent.setup()
        render(<StepCardTitleIcon messages={['Error 1']} />)

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Error 1')).toBeInTheDocument()
        })
    })

    it('should display multiple error messages in tooltip', async () => {
        const user = userEvent.setup()
        const errors = ['Error 1', 'Error 2', 'Error 3']
        render(<StepCardTitleIcon messages={errors} />)

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            errors.forEach((error) => {
                expect(screen.getByText(error)).toBeInTheDocument()
            })
        })
    })

    it('should apply error icon styles', () => {
        const { container } = render(<StepCardTitleIcon messages={['Error']} />)
        const iconElement = container.querySelector('.errorIcon')
        expect(iconElement).toBeInTheDocument()
    })

    it('should apply warning icon styles when variant is warning', () => {
        const { container } = render(
            <StepCardTitleIcon messages={['Warning']} variant="warning" />,
        )
        const iconElement = container.querySelector('.warningIcon')
        expect(iconElement).toBeInTheDocument()
    })

    it('should handle special characters in error messages', async () => {
        const user = userEvent.setup()
        const errors = [
            "Error with 'quotes'",
            'Error with <special> characters',
            'Error with & ampersand',
        ]
        render(<StepCardTitleIcon messages={errors} />)

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            errors.forEach((error) => {
                expect(screen.getByText(error)).toBeInTheDocument()
            })
        })
    })

    it('should handle long error messages', async () => {
        const user = userEvent.setup()
        const longError =
            'This is a very long error message that provides detailed information about what went wrong'
        render(<StepCardTitleIcon messages={[longError]} />)

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            expect(screen.getByText(longError)).toBeInTheDocument()
        })
    })

    it('should not render tooltip content when not hovering', () => {
        render(<StepCardTitleIcon messages={['Error 1']} />)

        expect(
            screen.queryByText("This step hasn't been configured yet."),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Error 1')).not.toBeInTheDocument()
    })

    it('should hide tooltip when mouse leaves', async () => {
        const user = userEvent.setup()
        render(<StepCardTitleIcon messages={['Error 1']} />)

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Error 1')).toBeInTheDocument()
        })

        await act(async () => {
            await user.unhover(errorIcon)
        })

        await waitFor(() => {
            expect(screen.queryByText('Error 1')).not.toBeInTheDocument()
        })
    })

    it('should handle empty strings in errors array', async () => {
        const user = userEvent.setup()
        const errors = ['', 'Valid error', '']
        render(<StepCardTitleIcon messages={errors} />)

        const errorIcon = screen.getByRole('img', { name: 'octagon-warning' })
        await act(async () => {
            await user.hover(errorIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Valid error')).toBeInTheDocument()
        })
    })
})
