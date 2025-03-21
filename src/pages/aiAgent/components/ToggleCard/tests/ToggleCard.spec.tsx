import { render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import userEvent from '@testing-library/user-event'

import { ToggleCard } from '../ToggleCard'

describe('ToggleCard', () => {
    const defaultProps = {
        title: 'Test Title',
        checked: false,
        onChange: jest.fn(),
        subtitle: 'Test Subtitle',
        style: {},
    }

    it('renders correctly with default props', () => {
        const { getByText } = render(<ToggleCard {...defaultProps} />)
        expect(getByText('Test Title')).toBeInTheDocument()
        expect(getByText('Test Subtitle')).toBeInTheDocument()
    })

    it('calls onChange when toggle button is clicked', () => {
        const { getByRole } = render(<ToggleCard {...defaultProps} />)
        userEvent.click(getByRole('checkbox'))
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
    })

    it('displays children when checked is true', () => {
        const { getByText } = render(
            <ToggleCard {...defaultProps} checked={true}>
                <div>Child Content</div>
            </ToggleCard>,
        )
        expect(getByText('Child Content')).toBeInTheDocument()
    })

    it('does not display children when checked is false', () => {
        const { queryByText } = render(
            <ToggleCard {...defaultProps} checked={false}>
                <div>Child Content</div>
            </ToggleCard>,
        )
        expect(queryByText('Child Content')).not.toBeInTheDocument()
    })

    it('toggles checked state when header section is clicked', () => {
        const { getByText } = render(<ToggleCard {...defaultProps} />)
        userEvent.click(getByText('Test Title'))
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
    })
})
