import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { SubmenuItem } from '../SubmenuItem'

const renderComponent = (
    props: Partial<Parameters<typeof SubmenuItem>[0]> = {},
) => {
    const defaultProps = {
        label: 'Test Label',
        onClick: jest.fn(),
    }

    return render(
        <ThemeProvider>
            <SubmenuItem {...defaultProps} {...props} />
        </ThemeProvider>,
    )
}

describe('<SubmenuItem />', () => {
    it('renders label text', () => {
        renderComponent({ label: 'My Label' })

        expect(screen.getByText('My Label')).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        renderComponent({ onClick })

        await user.click(screen.getByRole('button'))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('shows chevron icon by default', () => {
        renderComponent()

        expect(
            screen.getByRole('button').querySelector('svg'),
        ).toBeInTheDocument()
    })

    it('hides chevron when showChevron is false', () => {
        renderComponent({ showChevron: false })

        expect(
            screen.getByRole('button').querySelector('svg'),
        ).not.toBeInTheDocument()
    })

    it('has accessible button role', () => {
        renderComponent()

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('passes click event to handler', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        renderComponent({ onClick })

        await user.click(screen.getByRole('button'))

        expect(onClick).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'click',
            }),
        )
    })
})
