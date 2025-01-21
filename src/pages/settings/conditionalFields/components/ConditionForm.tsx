import {
    CreateCustomFieldCondition,
    CustomFieldCondition,
    UpdateCustomFieldCondition,
} from '@gorgias/api-queries'
import {
    validateCreateCustomFieldCondition,
    validateUpdateCustomFieldCondition,
} from '@gorgias/api-validators'
import {Label} from '@gorgias/merchant-ui-kit'
import React from 'react'

import {Form} from 'components/Form/Form'
import FormField from 'components/Form/FormField'
import FormSubmitButton from 'components/Form/FormSubmitButton'
import {createFormValidator} from 'components/Form/validation'
import Button from 'pages/common/components/button/Button'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import history from 'pages/history'
import settingsCss from 'pages/settings/settings.less'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import useSaveCondition from '../hooks/useSaveCondition'
import css from './ConditionForm.less'
import {DeletionPopover} from './DeletionPopover'
import {ExpressionField} from './ExpressionField'
import ThenField from './ThenField'

type ConditionFormProps = {
    condition?: CustomFieldCondition
}

export default function EditConditionForm({condition}: ConditionFormProps) {
    const {onSubmit, isSubmitting} = useSaveCondition(condition?.id)

    const editValues = {
        name: condition?.name,
        description: condition?.description || '',
        expression: condition?.expression,
        requirements: condition?.requirements,
        deactivated_datetime: condition?.deactivated_datetime,
    }

    const validator = createFormValidator(
        condition?.id
            ? validateUpdateCustomFieldCondition
            : validateCreateCustomFieldCondition
    )

    const handleFormSubmit = (
        data: CreateCustomFieldCondition | UpdateCustomFieldCondition
    ) => {
        void onSubmit(data)
    }

    return (
        <Form
            defaultValues={{
                name: '',
                description: '',
                object_type: 'Ticket',
                expression: [],
                requirements: [],
                deactivated_datetime: null,
            }}
            values={
                condition?.id
                    ? {...editValues, description: editValues.description ?? ''}
                    : undefined
            }
            onValidSubmit={handleFormSubmit}
            validator={validator}
        >
            <div className={settingsCss.contentWrapper}>
                <FormField
                    className={css.mbS}
                    name="name"
                    label="Condition name"
                    isRequired
                    placeholder="Provide a name for condition. E.g: Contact Reason Conditions"
                />
                <FormField
                    className={css.mbS}
                    name="description"
                    label="Condition description"
                    placeholder="Describe how the condition works. E.g: Display when contact reason includes quality and shipping"
                />
            </div>
            <fieldset className={css.fieldset}>
                <legend className={css.legend}>Condition requirements</legend>
                <p className={css.mbM}>
                    Configure Ticket Fields to appear for agents only when
                    specific values are selected.
                </p>
                <Label className={css.mbS}>
                    If the following criteria is met...
                </Label>
                <FormField
                    name="expression"
                    field={ExpressionField}
                    className={css.mbM}
                />
                <Label className={css.mbS}>
                    Then display the following fields...
                </Label>
                <FormField name="requirements" field={ThenField} />
            </fieldset>
            <FormField
                className={css.mbS}
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
