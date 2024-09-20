import React, {useCallback, useEffect, useRef, useState} from 'react'
import {set, pick} from 'lodash'
import {Location} from 'history'
import {Label, Tooltip} from '@gorgias/ui-kit'

import history from 'pages/history'

import {
    CustomField,
    CustomFieldInput,
    isCustomField,
    isCustomFieldAIManagedType,
} from 'models/customField/types'
import {useUpdateCustomFieldArchiveStatus} from 'hooks/customField/useUpdateCustomFieldArchiveStatus'
import InputField from 'pages/common/forms/input/InputField'
import CheckBox from 'pages/common/forms/CheckBox'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import DropdownInput from './DropdownInput'
import TypeSelectInput from './TypeSelectInput'

import css from './FieldForm.less'

const SAVE_BUTTON_ID = 'custom-fields-form-save-button'

interface FieldFormProps {
    field: CustomField | CustomFieldInput
    onSubmit: (field: CustomFieldInput) => Promise<void>
    onClose: () => void
    submitLabel?: string
}

const pickMap = {
    input: ['placeholder'],
    dropdown: ['choices', 'default'],
    input_number: ['min', 'max'],
}

function sanitizeInput(input: CustomFieldInput): CustomFieldInput {
    input.definition.input_settings = pick(
        input.definition.input_settings,
        ['input_type'].concat(
            pickMap[input.definition.input_settings.input_type]
        )
    ) as CustomFieldInput['definition']['input_settings']
    return input
}

export default function FieldForm(props: FieldFormProps) {
    const isAIManaged = isCustomFieldAIManagedType(props.field.managed_type)
    const {mutateAsync} = useUpdateCustomFieldArchiveStatus(
        // this `: 0` case should never happen
        isCustomField(props.field) ? props.field.id : 0
    )

    const formRef = useRef<HTMLFormElement>(null)

    const [archiveModalVisible, setArchiveModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)
    const [isFormDirty, setIsFormDirty] = useState(false)
    const [form, setForm] = useState(
        pick(props.field, [
            'object_type',
            'label',
            'description',
            'required',
            'managed_type',
            'definition',
        ])
    )

    // Use an effect since useRef() does not notify when the value is set
    useEffect(() => {
        setIsFormValid(formRef.current!.checkValidity() || false)
    }, [form])

    const setValue = useCallback((key: string, value: any) => {
        setIsFormDirty(true)
        setForm((form) => set({...form}, key, value))
    }, [])

    const save = async () => {
        setIsLoading(true)
        try {
            await props.onSubmit(sanitizeInput(form))
            setIsFormDirty(false)
            return true
        } catch (e) {
            console.error('Custom field error', e)
            setIsFormDirty(true)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    // On form submit, save the data then close the form
    const handleSubmit = async () => {
        if (await save()) {
            props.onClose()
        }
    }

    // When navigating away, save the data then navigate to the target location
    const handleSaveOnLeave = async (location?: Location) => {
        const ok = await save()
        if (ok && location) {
            history.push(location)
        }
    }

    const handleArchivingCustomField = useCallback(
        async (archived: boolean) => {
            setIsLoading(true)
            await mutateAsync(archived)
            setIsLoading(false)
        },
        [mutateAsync]
    )

    const handleChoiceChange = useCallback(
        (val) => setValue('definition.input_settings.choices', val),
        [setValue]
    )

    return (
        <form onSubmit={(evt) => evt.preventDefault()} ref={formRef}>
            {isCustomField(props.field) && (
                <div className={css.formRow}>
                    <Label className={css.formLabel}>Status</Label>
                    <Badge
                        type={
                            props.field.deactivated_datetime
                                ? ColorType.Classic
                                : ColorType.Success
                        }
                    >
                        {props.field.deactivated_datetime
                            ? 'ARCHIVED'
                            : 'ACTIVE'}
                    </Badge>
                </div>
            )}
            <InputField
                name="label"
                label="Name"
                placeholder="e.g. Contact Reason"
                caption="Visible to agents"
                value={form.label}
                onChange={(val) => setValue('label', val)}
                className={css.formRow}
                isRequired
                isDisabled={!!form.managed_type}
            />
            <TextArea
                name="description"
                label="Description"
                placeholder="e.g. Reasons why customers reach out to us"
                caption="Not visible to agents"
                rows={1}
                value={form.description || undefined}
                onChange={(val) => setValue('description', val)}
                className={css.formRow}
                isDisabled={isAIManaged}
            />
            {!isAIManaged && (
                <CheckBox
                    isChecked={form.required}
                    caption="Enable to prevent agents from closing the ticket if the field is left empty. Snooze and Send actions will still work."
                    onChange={(val) => setValue('required', val)}
                    className={css.formRow}
                >
                    Required to close ticket
                </CheckBox>
            )}
            <div className={css.formRow}>
                <Label
                    htmlFor="type"
                    className={css.formLabel}
                    isRequired
                    isDisabled={isAIManaged}
                >
                    Type
                </Label>
                <TypeSelectInput
                    value={`${form.definition.input_settings.input_type}_${form.definition.data_type}`}
                    onChange={(val) => {
                        const split = val.split('_')
                        const dataType = split.pop()
                        const inputType = split.join('_')
                        setValue(
                            'definition.input_settings.input_type',
                            inputType
                        )
                        setValue('definition.data_type', dataType)
                    }}
                    isDisabled={isCustomField(props.field)}
                />
                {!isAIManaged && (
                    <Caption>
                        Field type can’t be changed once it’s been saved.
                    </Caption>
                )}
            </div>
            {form.definition.data_type === 'text' &&
                form.definition.input_settings.input_type === 'input' && (
                    <InputField
                        name="settings.placeholder"
                        label="Placeholder"
                        value={form.definition.input_settings.placeholder}
                        onChange={(val) =>
                            setValue(
                                'definition.input_settings.placeholder',
                                val
                            )
                        }
                        className={css.formRow}
                    />
                )}
            {form.definition.data_type !== 'boolean' &&
                form.definition.input_settings.input_type === 'dropdown' && (
                    <div className={css.formRow}>
                        <DropdownInput
                            field={props.field}
                            value={form.definition.input_settings.choices}
                            onChange={handleChoiceChange}
                            isDisabled={isAIManaged}
                        />
                    </div>
                )}

            <div className={css.buttons}>
                <div className={css.leftGroup}>
                    {isAIManaged ? (
                        <Button intent="secondary" onClick={props.onClose}>
                            <ButtonIconLabel icon="arrow_back">
                                Return to Ticket Fields
                            </ButtonIconLabel>
                        </Button>
                    ) : (
                        <>
                            <Button
                                id={SAVE_BUTTON_ID}
                                intent="primary"
                                onClick={handleSubmit}
                                isDisabled={!isFormValid}
                                isLoading={isLoading}
                            >
                                {props.submitLabel || 'Save changes'}
                            </Button>
                            <Button intent="secondary" onClick={props.onClose}>
                                Cancel
                            </Button>
                            <Tooltip
                                disabled={!isFormDirty}
                                target={SAVE_BUTTON_ID}
                            >
                                Note: The values you have changed may be in use
                                in rules and macros. Make sure to edit the rules
                                and macros, as they will not be able to apply an
                                invalid value.
                            </Tooltip>
                        </>
                    )}
                </div>

                {isCustomField(props.field) && !isAIManaged && (
                    <>
                        {!props.field.deactivated_datetime && (
                            <div className={css.rightGroup}>
                                <Button
                                    intent="secondary"
                                    type="button"
                                    isDisabled={isLoading}
                                    isLoading={isLoading}
                                    onClick={() => setArchiveModalVisible(true)}
                                >
                                    Archive field
                                </Button>

                                <ArchiveConfirmationModal
                                    ticketFieldLabel={props.field.label}
                                    isOpen={archiveModalVisible}
                                    onConfirm={async () => {
                                        await handleArchivingCustomField(true)
                                        setArchiveModalVisible(false)
                                    }}
                                    onClose={() =>
                                        setArchiveModalVisible(false)
                                    }
                                />
                            </div>
                        )}
                        {props.field.deactivated_datetime && (
                            <Button
                                intent="secondary"
                                type="button"
                                isDisabled={isLoading}
                                isLoading={isLoading}
                                onClick={async () => {
                                    await handleArchivingCustomField(false)
                                }}
                            >
                                Unarchive field
                            </Button>
                        )}
                    </>
                )}
            </div>

            {isFormDirty && (
                <UnsavedChangesPrompt
                    onSave={handleSaveOnLeave}
                    when={isFormDirty}
                />
            )}
        </form>
    )
}
