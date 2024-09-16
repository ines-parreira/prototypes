import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import ConvertOnboardingStep from '../ConvertOnboardingStep'

describe('ConvertOnboardingStep', () => {
    const defaultProps = {
        number: 1,
        title: 'Title',
        description: 'Description',
        action: 'Action',
        isDisabled: false,
        isCompleted: false,
        onClick: jest.fn(),
    }

    test('renders with correct props', () => {
        const {getByText} = render(<ConvertOnboardingStep {...defaultProps} />)

        // Check if all props are rendered correctly
        expect(getByText('Title')).toBeInTheDocument()
        expect(getByText('Description')).toBeInTheDocument()
        expect(getByText('Action')).toBeInTheDocument()
        expect(getByText('1')).toBeInTheDocument()
    })

    test('calls onClick handler when action button is clicked', () => {
        const {getByText} = render(<ConvertOnboardingStep {...defaultProps} />)

        fireEvent.click(getByText('Action'))

        expect(defaultProps.onClick).toHaveBeenCalled()
    })

    test('disables action button when isDisabled is true', () => {
        const {getByRole} = render(
            <ConvertOnboardingStep {...defaultProps} isDisabled={true} />
        )

        expect(getByRole('button', {name: 'Action'})).toBeAriaDisabled()
    })

    test('renders completed icon when isCompleted is true', () => {
        render(<ConvertOnboardingStep {...defaultProps} isCompleted={true} />)

        expect(screen.getByLabelText('Step completed')).toBeInTheDocument()
    })
})
