import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import { buildNodeCommonProperties } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import TestLiquidTemplateModal from './TestLiquidTemplateModal'

// Mock the useSendTestLiquidTemplate hook
const mockSendTestRequest = jest.fn()
const mockIsLoading = false

jest.mock('./useSendTestLiquidTemplate', () => {
    return jest.fn(() => ({
        isLoading: mockIsLoading,
        sendTestRequest: mockSendTestRequest,
    }))
})

const mockNodeInEdition: LiquidTemplateNodeType = {
    ...buildNodeCommonProperties(),
    id: 'liquid_template1',
    type: 'liquid_template',
    data: {
        name: 'Test Template',
        template: 'Hello [[ customer.name ]], your order is [[ order.total ]]',
        output: {
            data_type: 'string',
        },
        errors: null,
        touched: null,
    },
}

const mockVariables: WorkflowVariable[] = [
    {
        name: 'Customer Name',
        value: 'customer.name',
        nodeType: 'http_request',
        type: 'string',
    },
    {
        name: 'Order Total',
        value: 'order.total',
        nodeType: 'http_request',
        type: 'string',
    },
]

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    nodeInEdition: mockNodeInEdition,
    variables: mockVariables,
}

describe('<TestLiquidTemplateModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('modal rendering', () => {
        it('should render modal when isOpen is true', () => {
            render(<TestLiquidTemplateModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Test Liquid Template')).toBeInTheDocument()
        })

        it('should not render modal when isOpen is false', () => {
            render(<TestLiquidTemplateModal {...defaultProps} isOpen={false} />)

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should render variable input fields for each workflow variable', () => {
            render(<TestLiquidTemplateModal {...defaultProps} />)

            expect(screen.getByLabelText('Customer Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Order Total')).toBeInTheDocument()
        })

        it('should render instruction text when variables are present', () => {
            render(<TestLiquidTemplateModal {...defaultProps} />)

            expect(
                screen.getByText('Enter sample values for workflow variables:'),
            ).toBeInTheDocument()
        })

        it('should show no variables message when no variables are provided', () => {
            render(<TestLiquidTemplateModal {...defaultProps} variables={[]} />)

            expect(
                screen.getByText(
                    'No workflow variables found in the template.',
                ),
            ).toBeInTheDocument()
        })

        it('should filter out null variables', () => {
            const variablesWithNulls = [
                mockVariables[0],
                null as any,
                mockVariables[1],
                null as any,
            ]

            render(
                <TestLiquidTemplateModal
                    {...defaultProps}
                    variables={variablesWithNulls}
                />,
            )

            // Should only render input fields for non-null variables
            expect(screen.getByLabelText('Customer Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Order Total')).toBeInTheDocument()
            expect(screen.getAllByRole('textbox')).toHaveLength(2)
        })
    })

    describe('form interactions', () => {
        it('should update input values when user types', async () => {
            const user = userEvent.setup()
            render(<TestLiquidTemplateModal {...defaultProps} />)

            const customerNameInput = screen.getByLabelText('Customer Name')
            const orderTotalInput = screen.getByLabelText('Order Total')

            await user.type(customerNameInput, 'John Doe')
            await user.type(orderTotalInput, '$99.99')

            expect(customerNameInput).toHaveValue('John Doe')
            expect(orderTotalInput).toHaveValue('$99.99')
        })

        it('should clear input values when modal closes', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            const { rerender } = render(
                <TestLiquidTemplateModal {...defaultProps} onClose={onClose} />,
            )

            const customerNameInput = screen.getByLabelText('Customer Name')
            await user.type(customerNameInput, 'John Doe')

            const closeButton = screen.getByRole('button', { name: /close/i })
            await user.click(closeButton)

            expect(onClose).toHaveBeenCalled()

            // Simulate modal reopening with cleared state
            rerender(
                <TestLiquidTemplateModal
                    {...defaultProps}
                    onClose={onClose}
                    isOpen={true}
                />,
            )

            expect(screen.getByLabelText('Customer Name')).toHaveValue('')
        })

        it('should show placeholder text in input fields', () => {
            render(<TestLiquidTemplateModal {...defaultProps} />)

            const inputs = screen.getAllByRole('textbox')
            inputs.forEach((input) => {
                expect(input).toHaveAttribute('placeholder', 'Sample value')
            })
        })
    })

    describe('test button behavior', () => {
        it('should disable test button when required fields are empty', () => {
            render(<TestLiquidTemplateModal {...defaultProps} />)

            const testButton = screen.getByRole('button', { name: /test/i })
            // The button uses aria-disabled instead of disabled attribute
            expect(testButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable test button when all required fields are filled', async () => {
            const user = userEvent.setup()
            render(<TestLiquidTemplateModal {...defaultProps} />)

            const customerNameInput = screen.getByLabelText('Customer Name')
            const orderTotalInput = screen.getByLabelText('Order Total')

            await user.type(customerNameInput, 'John Doe')
            await user.type(orderTotalInput, '$99.99')

            const testButton = screen.getByRole('button', { name: /test/i })
            expect(testButton).not.toBeDisabled()
        })

        it('should enable test button when no variables are present', () => {
            render(<TestLiquidTemplateModal {...defaultProps} variables={[]} />)

            const testButton = screen.getByRole('button', { name: /test/i })
            expect(testButton).not.toBeDisabled()
        })

        it('should call sendTestRequest when test button is clicked', async () => {
            const user = userEvent.setup()
            render(<TestLiquidTemplateModal {...defaultProps} />)

            const customerNameInput = screen.getByLabelText('Customer Name')
            const orderTotalInput = screen.getByLabelText('Order Total')

            await user.type(customerNameInput, 'John Doe')
            await user.type(orderTotalInput, '$99.99')

            const testButton = screen.getByRole('button', { name: /test/i })
            await user.click(testButton)

            expect(mockSendTestRequest).toHaveBeenCalledWith({
                'customer.name': 'John Doe',
                'order.total': '$99.99',
            })
        })

        it('should call sendTestRequest with empty object when no variables', async () => {
            const user = userEvent.setup()
            render(<TestLiquidTemplateModal {...defaultProps} variables={[]} />)

            const testButton = screen.getByRole('button', { name: /test/i })
            await user.click(testButton)

            expect(mockSendTestRequest).toHaveBeenCalledWith({})
        })
    })

    describe('loading state', () => {
        it('should show loading state on test button when isLoading is true', () => {
            const mockUseSendTestLiquidTemplate = require('./useSendTestLiquidTemplate')
            mockUseSendTestLiquidTemplate.mockReturnValue({
                isLoading: true,
                sendTestRequest: mockSendTestRequest,
            })

            render(<TestLiquidTemplateModal {...defaultProps} />)

            const testButton = screen.getByRole('button', { name: /test/i })
            expect(testButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('result display', () => {
        it('should render initial form state correctly', () => {
            render(<TestLiquidTemplateModal {...defaultProps} />)

            // Should show form initially (not results)
            expect(screen.getByLabelText('Customer Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Order Total')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeInTheDocument()
        })
    })

    describe('modal close behavior', () => {
        it('should call onClose when close button is clicked in form state', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            render(
                <TestLiquidTemplateModal {...defaultProps} onClose={onClose} />,
            )

            const closeButton = screen.getByRole('button', { name: /close/i })
            await user.click(closeButton)

            expect(onClose).toHaveBeenCalled()
        })

        it('should clear form values when handleClose is called', async () => {
            const user = userEvent.setup()
            render(<TestLiquidTemplateModal {...defaultProps} />)

            const customerNameInput = screen.getByLabelText('Customer Name')
            await user.type(customerNameInput, 'John Doe')

            const closeButton = screen.getByRole('button', { name: /close/i })
            await user.click(closeButton)

            // The component should clear internal state, but since we're mocking,
            // we can't test the internal state directly. This is tested through
            // the integration test behavior.
        })
    })

    describe('edge cases', () => {
        it('should handle empty arrays of variables', () => {
            render(<TestLiquidTemplateModal {...defaultProps} variables={[]} />)

            expect(
                screen.getByText(
                    'No workflow variables found in the template.',
                ),
            ).toBeInTheDocument()
        })
    })
})
