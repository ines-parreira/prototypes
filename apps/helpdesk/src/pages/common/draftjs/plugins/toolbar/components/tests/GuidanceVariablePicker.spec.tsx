import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { GuidanceVariable } from 'pages/aiAgent/components/GuidanceEditor/variables.types'

import GuidanceVariablePicker from '../GuidanceVariablePicker'

jest.mock('pages/common/components/button/Button', () => {
    return jest.fn(({ children, isDisabled, onClick }) => (
        <button
            data-testid="button"
            data-disabled={isDisabled ? 'true' : 'false'}
            disabled={isDisabled}
            onClick={onClick}
        >
            {children}
        </button>
    ))
})

jest.mock('../GuidanceVariableDropdown', () => {
    return jest.fn(({ onSelect, isOpen, onToggle }) =>
        isOpen ? (
            <div data-testid="guidance-variable-dropdown">
                <button
                    data-testid="select-variable-btn"
                    onClick={() => {
                        const mockVariable: GuidanceVariable = {
                            name: 'Customer Name',
                            value: '&&&customer.name&&&',
                            category: 'customer',
                        }
                        onSelect(mockVariable)
                        onToggle(false)
                    }}
                >
                    Select Variable
                </button>
            </div>
        ) : null,
    )
})

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Tooltip: jest.fn(({ children }) => (
        <div data-testid="tooltip">{children}</div>
    )),
}))

describe('GuidanceVariablePicker', () => {
    const defaultProps = {
        onSelect: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(<GuidanceVariablePicker {...defaultProps} />)

        const button = screen.getByText('{+} variables')
        expect(button).toBeInTheDocument()

        expect(
            screen.queryByTestId('guidance-variable-dropdown'),
        ).not.toBeInTheDocument()
    })

    it('renders with custom label', () => {
        render(
            <GuidanceVariablePicker {...defaultProps} label="Custom Label" />,
        )

        const button = screen.getByText('Custom Label')
        expect(button).toBeInTheDocument()
    })

    it('renders tooltip when tooltipMessage is provided', () => {
        render(
            <GuidanceVariablePicker
                {...defaultProps}
                tooltipMessage="Custom tooltip"
            />,
        )

        const tooltip = screen.getByTestId('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent('Custom tooltip')
    })

    it('does not render tooltip when tooltipMessage is null', () => {
        render(
            <GuidanceVariablePicker {...defaultProps} tooltipMessage={null} />,
        )

        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('opens dropdown when button is clicked', () => {
        render(<GuidanceVariablePicker {...defaultProps} />)

        fireEvent.click(screen.getByText('{+} variables'))

        expect(
            screen.getByTestId('guidance-variable-dropdown'),
        ).toBeInTheDocument()
    })

    it('calls onSelect when a variable is selected', () => {
        render(<GuidanceVariablePicker {...defaultProps} />)

        fireEvent.click(screen.getByText('{+} variables'))

        fireEvent.click(screen.getByTestId('select-variable-btn'))

        expect(defaultProps.onSelect).toHaveBeenCalledWith({
            name: 'Customer Name',
            value: '&&&customer.name&&&',
            category: 'customer',
        })
    })

    it('closes dropdown after selecting a variable', () => {
        render(<GuidanceVariablePicker {...defaultProps} />)

        fireEvent.click(screen.getByText('{+} variables'))

        fireEvent.click(screen.getByTestId('select-variable-btn'))

        expect(
            screen.queryByTestId('guidance-variable-dropdown'),
        ).not.toBeInTheDocument()
    })

    it('disables the button when disabled prop is true', () => {
        render(<GuidanceVariablePicker {...defaultProps} disabled={true} />)

        const button = screen.getByTestId('button')
        expect(button).toHaveAttribute('data-disabled', 'true')
        expect(button).toBeDisabled()
    })

    it('passes variableDropdownProps to GuidanceVariableDropdown', () => {
        const GuidanceVariableDropdown = require('../GuidanceVariableDropdown')
        const variableDropdownProps = {
            noSelectedCategoryText: 'Custom text',
        }

        render(
            <GuidanceVariablePicker
                {...defaultProps}
                variableDropdownProps={variableDropdownProps}
            />,
        )

        fireEvent.click(screen.getByText('{+} variables'))

        expect(GuidanceVariableDropdown).toHaveBeenCalledWith(
            expect.objectContaining({
                noSelectedCategoryText: 'Custom text',
            }),
            expect.anything(),
        )
    })
})
