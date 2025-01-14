import {
    CreateCustomFieldCondition,
    CustomFieldCondition,
    // ExpressionFieldSource,
    // ExpressionFieldType,
    // ExpressionOperator,
    UpdateCustomFieldCondition,
} from '@gorgias/api-queries'
import {
    validateCreateCustomFieldCondition,
    validateUpdateCustomFieldCondition,
} from '@gorgias/api-validators'
import React from 'react'

import {Form} from 'components/Form/Form'
import FormField from 'components/Form/FormField'
import FormSubmitButton from 'components/Form/FormSubmitButton'
import {createFormValidator} from 'components/Form/validation'
import Button from 'pages/common/components/button/Button'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import history from 'pages/history'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import useSaveCondition from '../hooks/useSaveCondition'
import css from './ConditionForm.less'
import {DeletionPopover} from './DeletionPopover'

type ConditionFormProps = {
    condition?: CustomFieldCondition
}

export default function EditConditionForm({condition}: ConditionFormProps) {
    const {onSubmit, isSubmitting} = useSaveCondition(condition?.id)

    const {
        created_datetime: __discarded_created_datetime,
        object_type: __discarded_object_type,
        id: __discarded_id,
        ...editValues
    } = condition ?? {}

    const validator = createFormValidator(
        condition?.id
            ? validateUpdateCustomFieldCondition
            : validateCreateCustomFieldCondition
    )

    const handleFormSubmit = (
        data: CreateCustomFieldCondition | UpdateCustomFieldCondition
    ) => {
        // console.log('Submitting data', data)
        void onSubmit(data)
    }

    // const handleInvalidSubmit = (errors: unknown) => {
    //     console.log('Invalid submit', errors)
    // }

    return (
        <Form
            defaultValues={{
                name: '',
                object_type: 'Ticket',
                // uncomment to be able to submit a new condition
                // requirements: [
                //     {
                //         field_id: 1,
                //         type: ExpressionFieldType.Visible,
                //     },
                // ],
                // expression: [
                //     {
                //         values: [''],
                //         operator: ExpressionOperator.IsOneOf,
                //         field: 1,
                //         field_source: ExpressionFieldSource.Ticket,
                //     },
                // ],
                deactivated_datetime: null,
            }}
            values={editValues}
            onValidSubmit={handleFormSubmit}
            // onInvalidSubmit={handleInvalidSubmit}
            validator={validator}
        >
            <FormField
                className={css.fieldSpacer}
                name="name"
                label="Condition name"
                isRequired
                placeholder="Provide a name for condition. E.g: Contact Reason Conditions"
            />
            <FormField
                className={css.fieldSpacer}
                field={ToggleInputField}
                name="deactivated_datetime"
                inputTransform={(value: string | null) => !value}
                outputTransform={(value) =>
                    !value ? new Date().toISOString() : null
                }
            >
                Enable Condition
            </FormField>
            <div className={css.formFooter}>
                <span>
                    <FormSubmitButton isLoading={isSubmitting} />
                    <Button
                        className={css.cancelButton}
                        type="button"
                        intent="secondary"
                        onClick={() => {
                            history.push(
                                `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`
                            )
                        }}
                    >
                        Cancel
                    </Button>
                </span>
                {condition && (
                    <DeletionPopover condition={condition} redirect>
                        {({uid, onDisplayConfirmation}) => (
                            <Button
                                type="button"
                                fillStyle="ghost"
                                intent="destructive"
                                onClick={onDisplayConfirmation}
                                leadingIcon="delete"
                                id={uid}
                            >
                                Delete Condition
                            </Button>
                        )}
                    </DeletionPopover>
                )}
            </div>
        </Form>
    )
}
