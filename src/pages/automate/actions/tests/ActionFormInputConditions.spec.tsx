import React from 'react'
import {render} from '@testing-library/react'
import {FormProvider, useForm} from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import ToolbarContext, {
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import {getInputVariables} from '../utils'
import ActionFormInputConditions from '../components/ActionFormInputConditions'
import {ConditionsFormValues} from '../types'

const defaultValues: ConditionsFormValues = {
    conditions: [],
    conditionsType: null,
}

const inputVariables = getInputVariables([])

const Form = (props: any) => {
    const methods = useForm({
        ...props,
        mode: 'onBlur',
    })
    return (
        <ToolbarContext.Provider
            value={
                {
                    workflowVariables: inputVariables,
                } as ToolbarContextType
            }
        >
            <FormProvider {...methods}>
                <form>
                    <ActionFormInputConditions {...props} />
                </form>
            </FormProvider>
        </ToolbarContext.Provider>
    )
}

describe('ActionFormInputConditions', () => {
    it('renders form with valid state', async () => {
        const {
            getByText,
            getAllByRole,
            getAllByLabelText,
            getByPlaceholderText,
        } = render(
            <Form
                inputVariables={inputVariables}
                defaultValues={defaultValues}
            />
        )

        const [noConditions] = getAllByRole('radio')
        expect(noConditions).toHaveAttribute('aria-checked', 'true')

        const [andType] = getAllByLabelText('All conditions are met')
        userEvent.click(andType)

        const addConditionButton = getByText('Add condition', {exact: false})
        expect(addConditionButton).toBeInTheDocument()

        userEvent.click(addConditionButton)
        userEvent.click(getByText('Existing customer', {exact: false}))
        userEvent.click(getByText('Customer first name', {exact: false}))

        expect(getByText('Enter a value')).toBeInTheDocument()
        await userEvent.type(getByPlaceholderText('value'), 'value')
        userEvent.click(getByText('clear'))
        userEvent.click(noConditions)

        expect(addConditionButton).not.toBeInTheDocument()
    })
})
