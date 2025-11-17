import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'

import TestRequestInputs from '../TestRequestInputs'

const mockOnSendTestRequest = jest.fn()
const mockOnClose = jest.fn()

const defaultProps = {
    isLoading: false,
    inputs: [
        {
            name: 'Input 1',
            value: 'input1',
            nodeType: 'text_reply' as const,
            type: 'string',
        } as WorkflowVariable,
        {
            name: 'Input 2',
            value: 'input2',
            nodeType: 'text_reply' as const,
            type: 'string',
        } as WorkflowVariable,
    ],
    refreshTokenUrl: 'https://example.com/token',
    onSendTestRequest: mockOnSendTestRequest,
    onClose: mockOnClose,
}

describe('TestRequestInputs Component', () => {
    it('renders correctly for variables as well', () => {
        render(
            <TestRequestInputs
                {...{ ...defaultProps, refreshTokenUrl: undefined }}
            />,
        )
        expect(
            screen.getByText('Enter sample values to test request'),
        ).toBeInTheDocument()
        defaultProps.inputs.forEach((input) => {
            expect(screen.getByLabelText(input.name)).toBeInTheDocument()
        })
        expect(screen.getByText('Close')).toBeInTheDocument()
        expect(screen.getByText('Continue')).toBeInTheDocument()
    })
    it('renders correctly', () => {
        render(<TestRequestInputs {...{ ...defaultProps, inputs: [] }} />)
        expect(
            screen.getByText('Enter refresh token to test request'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Refresh Token')).toBeInTheDocument()
        expect(screen.getByText('Close')).toBeInTheDocument()
        expect(screen.getByText('Continue')).toBeInTheDocument()
    })
    it('renders correctly', () => {
        render(<TestRequestInputs {...defaultProps} />)

        // Check for ModalHeader
        expect(
            screen.getByText(
                'Enter refresh token and sample values to test request',
            ),
        ).toBeInTheDocument()

        // Check for Refresh Token input
        expect(screen.getByLabelText('Refresh Token')).toBeInTheDocument()

        // Check for Input Fields
        defaultProps.inputs.forEach((input) => {
            expect(screen.getByLabelText(input.name)).toBeInTheDocument()
        })

        // Check for buttons
        expect(screen.getByText('Close')).toBeInTheDocument()
        expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('calls onClose when Close button is clicked', () => {
        render(<TestRequestInputs {...defaultProps} />)

        fireEvent.click(screen.getByText('Close'))

        expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onSendTestRequest with correct values when Continue button is clicked', () => {
        render(<TestRequestInputs {...defaultProps} />)

        // Fill in Refresh Token
        fireEvent.change(screen.getByLabelText('Refresh Token'), {
            target: { value: 'sample-refresh-token' },
        })

        // Fill in Input Fields
        defaultProps.inputs.forEach((input) => {
            fireEvent.change(screen.getByLabelText(input.name), {
                target: { value: `value for ${input.name}` },
            })
        })

        // Click Continue button
        fireEvent.click(screen.getByText('Continue'))

        expect(mockOnSendTestRequest).toHaveBeenCalledWith(
            {
                input1: 'value for Input 1',
                input2: 'value for Input 2',
            },
            'sample-refresh-token',
            'https://example.com/token',
        )
    })

    it('loads initial values from props when provided', () => {
        const initialValues = {
            input1: 'persisted value 1',
            input2: 'persisted value 2',
        }

        render(
            <TestRequestInputs
                {...defaultProps}
                initialValues={initialValues}
                initialRefreshToken="persisted-refresh-token"
            />,
        )

        // Check that input fields have the initial values
        expect(screen.getByLabelText('Input 1')).toHaveValue(
            'persisted value 1',
        )
        expect(screen.getByLabelText('Input 2')).toHaveValue(
            'persisted value 2',
        )
        expect(screen.getByLabelText('Refresh Token')).toHaveValue(
            'persisted-refresh-token',
        )
    })

    it('uses initial values when Continue is clicked', () => {
        const initialValues = {
            input1: 'initial value 1',
            input2: 'initial value 2',
        }

        render(
            <TestRequestInputs
                {...defaultProps}
                initialValues={initialValues}
                initialRefreshToken="initial-refresh-token"
            />,
        )

        // Click Continue without changing values
        fireEvent.click(screen.getByText('Continue'))

        expect(mockOnSendTestRequest).toHaveBeenCalledWith(
            initialValues,
            'initial-refresh-token',
            'https://example.com/token',
        )
    })
})
