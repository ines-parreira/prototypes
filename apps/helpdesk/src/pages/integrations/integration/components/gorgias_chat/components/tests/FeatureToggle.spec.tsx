import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { FeatureToggle } from '../FeatureToggle'

const defaultProps = {
    label: 'Order management',
    caption:
        'Let customers sign in to track, return, cancel or report issues with orders.',
    value: false,
    onChange: jest.fn(),
}

const renderComponent = (
    props: Partial<React.ComponentProps<typeof FeatureToggle>> = {},
) => {
    return render(<FeatureToggle {...defaultProps} {...props} />)
}

describe('FeatureToggle', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders label and caption', () => {
        renderComponent()

        expect(screen.getByText('Order management')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Let customers sign in to track, return, cancel or report issues with orders.',
            ),
        ).toBeInTheDocument()
    })

    it('renders tag when provided', () => {
        renderComponent({
            tag: {
                text: 'Automate up to 50% of tickets',
                color: 'purple',
                icon: 'zap',
            },
        })

        expect(
            screen.getByText('Automate up to 50% of tickets'),
        ).toBeInTheDocument()
    })

    it('renders tag with default purple color when color is not specified', () => {
        renderComponent({
            tag: {
                text: 'New feature',
            },
        })

        expect(screen.getByText('New feature')).toBeInTheDocument()
    })

    it('renders tag without icon when icon is not specified', () => {
        renderComponent({
            tag: {
                text: 'Beta',
                color: 'blue',
            },
        })

        expect(screen.getByText('Beta')).toBeInTheDocument()
    })

    it('does not render tag when not provided', () => {
        renderComponent({ tag: undefined })

        expect(
            screen.queryByText('Automate up to 50% of tickets'),
        ).not.toBeInTheDocument()
    })

    it('calls onChange when toggle is clicked', async () => {
        const onChange = jest.fn()
        renderComponent({ onChange, value: false })

        await act(() => userEvent.click(screen.getByRole('switch')))

        expect(onChange).toHaveBeenCalledWith(true)
    })

    it('renders toggle as checked when value is true', () => {
        renderComponent({ value: true })

        expect(screen.getByRole('switch')).toBeChecked()
    })

    it('renders toggle as unchecked when value is false', () => {
        renderComponent({ value: false })

        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('disables toggle when isDisabled is true', () => {
        renderComponent({ isDisabled: true })

        expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('does not call onChange when disabled toggle is clicked', async () => {
        const onChange = jest.fn()
        renderComponent({ onChange, isDisabled: true })

        await act(() => userEvent.click(screen.getByRole('switch')))

        expect(onChange).not.toHaveBeenCalled()
    })
})
