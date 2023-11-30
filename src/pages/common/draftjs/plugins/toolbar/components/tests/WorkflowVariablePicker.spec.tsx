import React from 'react'
import {render, screen} from '@testing-library/react'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import WorkflowVariablePicker, {
    WorkflowVariablePickerProps,
} from '../WorkflowVariablePicker'
import ToolbarProvider from '../../ToolbarProvider'

const workflowVariables: WorkflowVariableList = [
    {
        nodeType: 'text_reply',
        name: 'Customer first name',
        value: 'customer_first_name',
    },
    {
        nodeType: 'multiple_choices',
        name: 'Customer last name',
        value: 'customer_last_name',
    },
    {
        nodeType: 'order_selection',
        name: 'Which order are you contacting us about?',
        variables: [
            {
                nodeType: 'text_reply',
                name: 'Order ID',
                value: 'order_id',
            },
            {
                nodeType: 'text_reply',
                name: 'Order date',
                value: 'order_date',
            },
            {
                nodeType: 'text_reply',
                name: 'Order total',
                value: 'order_total',
            },
        ],
    },
]
describe('WorkflowVariablePicker', () => {
    const renderWithToolbarProvider = (
        overrides?: Partial<WorkflowVariablePickerProps>
    ) =>
        render(
            <ToolbarProvider workflowVariables={workflowVariables}>
                <WorkflowVariablePicker onSelect={jest.fn()} {...overrides} />
            </ToolbarProvider>
        )

    it('should render correctly', () => {
        renderWithToolbarProvider()
        expect(screen).toBeDefined()
    })

    it('should render the variables button', () => {
        renderWithToolbarProvider()
        expect(screen.getByRole('button')).toHaveTextContent(/{\+} variables/i)
    })

    it('should render a dropdown when the button is clicked', () => {
        renderWithToolbarProvider()
        screen.getByRole('button').click()
        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()
    })

    it("should change the dropdown's content when a category is selected", () => {
        // temp until we render the content from the context
        renderWithToolbarProvider()
        screen.getByRole('button').click()
        screen.getByText('Which order are you contacting us about?').click()
        expect(screen.getByTestId('floating-overlay')).toHaveTextContent(
            'Order ID'
        )
        expect(screen.getByTestId('floating-overlay')).toHaveTextContent(
            'Order date'
        )
        expect(screen.getByTestId('floating-overlay')).toHaveTextContent(
            'Order total'
        )
    })

    it("should go back to the categories when the 'back' button is clicked", () => {
        renderWithToolbarProvider()
        screen.getByRole('button').click()
        screen.getByText('Which order are you contacting us about?').click()
        screen.getByText('arrow_back').click()
        expect(screen.getByTestId('floating-overlay')).toHaveTextContent(
            'Customer first name'
        )
    })

    it('should close the dropdown when selecting an item', () => {
        renderWithToolbarProvider()
        screen.getByRole('button').click()
        screen.getByText('Which order are you contacting us about?').click()
        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()
        screen.getByText('Order ID').click()
        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
    })

    it("should call the 'onSelect' callback when selecting an item", () => {
        const onSelect = jest.fn()
        renderWithToolbarProvider({onSelect})
        screen.getByRole('button').click()
        screen.getByText('Which order are you contacting us about?').click()
        screen.getByText('Order ID').click()
        expect(onSelect).toHaveBeenCalledWith('order_id')
    })
})
