import {act, fireEvent, render, screen} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {FormProvider, useForm} from 'react-hook-form'

import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

import {ActionFormInputValues} from '../../types'

import ActionFormInputConditions from '../ActionFormInputConditions'

const variables: WorkflowVariableList = [
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

describe('<ActionFormInputConditions />', () => {
    it('should render form with valid state', () => {
        const {result} = renderHook(() =>
            useForm<ActionFormInputValues>({
                mode: 'onBlur',
                defaultValues: {
                    name: '',
                    trigger: {
                        instructions: '',
                        requires_confirmation: false,
                        conditionsType: null,
                        conditions: [],
                        inputs: [],
                    },
                },
            })
        )

        render(
            <ToolbarProvider workflowVariables={variables}>
                <FormProvider {...result.current}>
                    <ActionFormInputConditions variables={variables} />
                </FormProvider>
            </ToolbarProvider>
        )

        expect(
            screen.getByLabelText('No conditions required', {selector: 'div'})
        ).toHaveAttribute('aria-checked', 'true')

        expect(
            screen.queryByText('Add condition', {exact: false})
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('clear', {exact: false})
        ).not.toBeInTheDocument()

        act(() => {
            fireEvent.click(
                screen.getByLabelText('All conditions are met', {
                    selector: 'div',
                })
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('Add condition', {exact: false}))
        })

        act(() => {
            fireEvent.click(
                screen.getByText('Existing customer', {exact: false})
            )
        })

        act(() => {
            fireEvent.click(
                screen.getByText('Customer first name', {exact: false})
            )
        })

        expect(screen.getByText('Enter a value')).toBeInTheDocument()

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('value'), {
                target: {value: 'value'},
            })
        })

        act(() => {
            fireEvent.focus(screen.getByText('Is'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Is not'))
        })

        expect(screen.getByText('Is not')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('clear'))
        })

        act(() => {
            fireEvent.click(
                screen.getByLabelText('No conditions required', {
                    selector: 'div',
                })
            )
        })

        expect(
            screen.queryByText('Add condition', {exact: false})
        ).not.toBeInTheDocument()
    })
})
