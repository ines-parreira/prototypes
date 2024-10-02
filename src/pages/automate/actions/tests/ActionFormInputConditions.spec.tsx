import React from 'react'
import {render, screen} from '@testing-library/react'
import {FormProvider, useForm} from 'react-hook-form'
import userEvent from '@testing-library/user-event'

import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'

import {ActionFormInputValues} from '../types'
import ActionFormInputConditions from '../components/ActionFormInputConditions'

const defaultValues: ActionFormInputValues = {
    name: '',
    trigger: {
        instructions: '',
        requires_confirmation: false,
        conditionsType: null,
        conditions: [],
        inputs: [],
    },
}

const inputVariables: WorkflowVariableList = [
    {
        name: 'Existing customer',
        nodeType: 'shopper_authentication',
        variables: [
            {
                name: 'Customer first name',
                value: 'objects.customer.firstname',
                nodeType: 'shopper_authentication',
                type: 'string',
            },
        ],
    },
]

const Form = (props: any) => {
    const methods = useForm({
        ...props,
        mode: 'onBlur',
    })
    return (
        <ToolbarProvider workflowVariables={inputVariables}>
            <FormProvider {...methods}>
                <form>
                    <ActionFormInputConditions {...props} />
                </form>
            </FormProvider>
        </ToolbarProvider>
    )
}

describe('ActionFormInputConditions', () => {
    it('renders form with valid state', async () => {
        render(
            <Form variables={inputVariables} defaultValues={defaultValues} />
        )

        const [noConditions] = screen.getAllByRole('radio')
        expect(noConditions).toHaveAttribute('aria-checked', 'true')

        const [andType] = screen.getAllByLabelText('All conditions are met')
        userEvent.click(andType)

        const addConditionButton = screen.getByText('Add condition', {
            exact: false,
        })
        expect(addConditionButton).toBeInTheDocument()

        userEvent.click(addConditionButton)
        userEvent.click(screen.getByText('Existing customer', {exact: false}))
        userEvent.click(screen.getByText('Customer first name', {exact: false}))

        expect(screen.getByText('Enter a value')).toBeInTheDocument()

        expect(screen.getByText('Enter a value')).toBeInTheDocument()
        await userEvent.type(screen.getByPlaceholderText('value'), 'value')
        userEvent.click(screen.getByText('clear'))
        userEvent.click(noConditions)

        expect(addConditionButton).not.toBeInTheDocument()
    })
})
