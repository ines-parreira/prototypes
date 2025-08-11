import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StepCardErrorIcon } from '../StepCardErrorIcon'

describe('StepCardErrorIcon', () => {
    it('should render warning icon when errors are present', () => {
        render(<StepCardErrorIcon errors={['Error 1']} />)
        expect(screen.getByText('warning_amber')).toBeInTheDocument()
    })

    it('should display custom error title in tooltip', async () => {
        const user = userEvent.setup()
        render(
            <StepCardErrorIcon
                errorTitle="Custom error title"
                errors={['Error 1']}
            />,
        )

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Custom error title')).toBeInTheDocument()
            expect(screen.getByText('Error 1')).toBeInTheDocument()
        })
    })

    it('should not display error title when not provided', async () => {
        const user = userEvent.setup()
        render(<StepCardErrorIcon errors={['Error 1']} />)

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Error 1')).toBeInTheDocument()
        })
    })

    it('should display multiple error messages in tooltip', async () => {
        const user = userEvent.setup()
        const errors = ['Error 1', 'Error 2', 'Error 3']
        render(<StepCardErrorIcon errors={errors} />)

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
        })

        await waitFor(() => {
            errors.forEach((error) => {
                expect(screen.getByText(error)).toBeInTheDocument()
            })
        })
    })

    it('should apply error icon styles', () => {
        const { container } = render(<StepCardErrorIcon errors={['Error']} />)
        const iconElement = container.querySelector('.errorIcon')
        expect(iconElement).toBeInTheDocument()
    })

    it('should handle special characters in error messages', async () => {
        const user = userEvent.setup()
        const errors = [
            "Error with 'quotes'",
            'Error with <special> characters',
            'Error with & ampersand',
        ]
        render(<StepCardErrorIcon errors={errors} />)

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
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
        render(<StepCardErrorIcon errors={[longError]} />)

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
        })

        await waitFor(() => {
            expect(screen.getByText(longError)).toBeInTheDocument()
        })
    })

    it('should not render tooltip content when not hovering', () => {
        render(<StepCardErrorIcon errors={['Error 1']} />)

        expect(
            screen.queryByText("This step hasn't been configured yet."),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Error 1')).not.toBeInTheDocument()
    })

    it('should hide tooltip when mouse leaves', async () => {
        const user = userEvent.setup()
        render(<StepCardErrorIcon errors={['Error 1']} />)

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Error 1')).toBeInTheDocument()
        })

        await act(async () => {
            await user.unhover(warningIcon)
        })

        await waitFor(() => {
            expect(screen.queryByText('Error 1')).not.toBeInTheDocument()
        })
    })

    it('should handle empty strings in errors array', async () => {
        const user = userEvent.setup()
        const errors = ['', 'Valid error', '']
        render(<StepCardErrorIcon errors={errors} />)

        const warningIcon = screen.getByText('warning_amber')
        await act(async () => {
            await user.hover(warningIcon)
        })

        await waitFor(() => {
            expect(screen.getByText('Valid error')).toBeInTheDocument()
        })
    })
})
