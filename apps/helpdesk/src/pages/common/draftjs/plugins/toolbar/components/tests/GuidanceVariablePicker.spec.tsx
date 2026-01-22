import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GuidanceVariable } from 'pages/aiAgent/components/GuidanceEditor/variables.types'

import GuidanceVariablePicker from '../GuidanceVariablePicker'

jest.mock('../GuidanceVariableDropdown', () => {
    return jest.fn(({ onSelect, isOpen, onToggle }) =>
        isOpen ? (
            <div role="menu" aria-label="Variable dropdown">
                <button
                    role="menuitem"
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

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacyTooltip: jest.fn(({ children }) => (
        <div role="tooltip">{children}</div>
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

        const button = screen.getByRole('button', { name: /\{\+\} Variables/i })
        expect(button).toBeInTheDocument()

        expect(
            screen.queryByRole('menu', { name: /Variable dropdown/i }),
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

        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent('Custom tooltip')
    })

    it('does not render tooltip when tooltipMessage is null', () => {
        render(
            <GuidanceVariablePicker {...defaultProps} tooltipMessage={null} />,
        )

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('opens dropdown when button is clicked', async () => {
        const user = userEvent.setup()
        render(<GuidanceVariablePicker {...defaultProps} />)

        await user.click(
            screen.getByRole('button', { name: /\{\+\} Variables/i }),
        )

        expect(
            screen.getByRole('menu', { name: /Variable dropdown/i }),
        ).toBeInTheDocument()
    })

    it('calls onSelect when a variable is selected', async () => {
        const user = userEvent.setup()
        render(<GuidanceVariablePicker {...defaultProps} />)

        await user.click(
            screen.getByRole('button', { name: /\{\+\} Variables/i }),
        )

        await user.click(
            screen.getByRole('menuitem', { name: /Select Variable/i }),
        )

        expect(defaultProps.onSelect).toHaveBeenCalledWith({
            name: 'Customer Name',
            value: '&&&customer.name&&&',
            category: 'customer',
        })
    })

    it('closes dropdown after selecting a variable', async () => {
        const user = userEvent.setup()
        render(<GuidanceVariablePicker {...defaultProps} />)

        await user.click(
            screen.getByRole('button', { name: /\{\+\} Variables/i }),
        )

        await user.click(
            screen.getByRole('menuitem', { name: /Select Variable/i }),
        )

        expect(
            screen.queryByRole('menu', { name: /Variable dropdown/i }),
        ).not.toBeInTheDocument()
    })

    it('disables the button when disabled prop is true', () => {
        render(<GuidanceVariablePicker {...defaultProps} disabled={true} />)

        const button = screen.getByRole('button', { name: /\{\+\} variables/i })

        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('passes variableDropdownProps to GuidanceVariableDropdown', async () => {
        const GuidanceVariableDropdown = require('../GuidanceVariableDropdown')
        const user = userEvent.setup()
        const variableDropdownProps = {
            noSelectedCategoryText: 'Custom text',
        }

        render(
            <GuidanceVariablePicker
                {...defaultProps}
                variableDropdownProps={variableDropdownProps}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /\{\+\} Variables/i }),
        )

        expect(GuidanceVariableDropdown).toHaveBeenCalledWith(
            expect.objectContaining({
                noSelectedCategoryText: 'Custom text',
            }),
            expect.anything(),
        )
    })
})
