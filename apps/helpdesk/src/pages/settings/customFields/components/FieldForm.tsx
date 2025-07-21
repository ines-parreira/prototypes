import { useCallback, useEffect, useRef, useState } from 'react'

import { cloneDeep, pick, set } from 'lodash'

import { Badge, Button, Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { getUIDataType } from 'custom-fields/helpers/getUIDataType'
import { useUpdateCustomFieldArchiveStatus } from 'custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus'
import {
    CustomField,
    CustomFieldInput,
    isCustomField,
    isCustomFieldSystemReadOnly,
} from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import Caption from 'pages/common/forms/Caption/Caption'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import DropdownInput from 'pages/settings/customFields/components/DropdownInput'
import css from 'pages/settings/customFields/components/FieldForm.less'
import RequirementTypeInput from 'pages/settings/customFields/components/RequirementTypeInput'
import TypeSelectInput from 'pages/settings/customFields/components/TypeSelectInput'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const SAVE_BUTTON_ID = 'custom-fields-form-save-button'
const TOOLTIP_MESSAGE =
    'Note: The values you have changed may be in use in Rules, Macros and Saved Filters. Make sure to edit them, as they will not be able to apply an invalid value.'

interface FieldFormProps {
    field: CustomField | CustomFieldInput
    onSubmit: (field: CustomFieldInput) => Promise<unknown>
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
            pickMap[input.definition.input_settings.input_type],
        ),
    ) as CustomFieldInput['definition']['input_settings']

    return input
}

export default function FieldForm(props: FieldFormProps) {
    const dispatch = useAppDispatch()

    const objectTypeSettings = OBJECT_TYPE_SETTINGS[props.field.object_type]
    const customFieldTitleLabel = objectTypeSettings.TITLE_LABEL
    const isReadOnly = isCustomFieldSystemReadOnly(props.field.managed_type)
    const { mutateAsync } = useUpdateCustomFieldArchiveStatus(
        // this `: 0` case should never happen
        isCustomField(props.field) ? props.field.id : 0,
        props.field.object_type,
    )

    const formRef = useRef<HTMLFormElement>(null)

    const [archiveModalVisible, setArchiveModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)
    const [isFormDirty, setIsFormDirty] = useState(false)

    // we need to deep clone the initial form to avoid mutating the initial definition object & choices array that is passed by reference
    const [form, setForm] = useState(
        cloneDeep(
            pick(props.field, [
                'object_type',
                'label',
                'description',
                'required',
                'requirement_type',
                'managed_type',
                'definition',
            ]),
        ),
    )

    // Use an effect since useRef() does not notify when the value is set
    useEffect(() => {
        let isValid = formRef.current!.checkValidity() || false
        if (
            form.definition.data_type === 'text' &&
            form.definition.input_settings.input_type === 'dropdown'
        ) {
            isValid =
                isValid && form.definition.input_settings.choices?.length > 0
        }
        setIsFormValid(isValid)
    }, [form])

    const setValue = useCallback((key: string, value: any) => {
        setIsFormDirty(true)
        setForm((form) => set({ ...form }, key, value))
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
    const handleSaveOnLeave = async () => {
        if (!isFormValid) {
            dispatch(
                notify({
                    title: 'Unable to save, please complete all required fields',
                    status: NotificationStatus.Error,
                }),
            )
            throw new Error('Error saving custom field')
        }
        const ok = await save()
        if (!ok) {
            throw new Error('Error saving custom field')
        }
    }

    const handleArchivingCustomField = useCallback(
        async (archived: boolean) => {
            setIsLoading(true)
            await mutateAsync(archived)
            setIsLoading(false)
        },
        [mutateAsync],
    )

    const handleChoiceChange = useCallback(
        (val: string[]) => setValue('definition.input_settings.choices', val),
        [setValue],
    )

    const showRequired =
        props.field.object_type === OBJECT_TYPES.TICKET && !isReadOnly

    return (
        <form onSubmit={(evt) => evt.preventDefault()} ref={formRef}>
            {isCustomField(props.field) && (
                <div className={css.formRow}>
                    <Label className={css.formLabel}>Status</Label>
                    <Badge
                        type={
                            props.field.deactivated_datetime
                                ? 'classic'
                                : 'success'
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
                placeholder={objectTypeSettings.PLACEHOLDERS.LABEL}
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
                placeholder={objectTypeSettings.PLACEHOLDERS.DESCRIPTION}
                caption="Not visible to agents"
                rows={1}
                value={form.description || undefined}
                onChange={(val) => setValue('description', val)}
                className={css.formRow}
                isDisabled={isReadOnly}
            />
            {showRequired && (
                <RequirementTypeInput
                    value={form.requirement_type}
                    onChange={(val) => setValue('requirement_type', val)}
                    className={css.formRow}
                />
            )}
            <div className={css.formRow}>
                <Label
                    htmlFor="type"
                    className={css.formLabel}
                    isRequired
                    isDisabled={isReadOnly}
                >
                    Type
                </Label>
                <TypeSelectInput
                    value={getUIDataType(
                        form.definition.data_type,
                        form.definition.input_settings.input_type,
                    )}
                    onChange={(val) => {
                        const split = val.split('_')
                        const dataType = split.pop()
                        const inputType = split.join('_')
                        setValue(
                            'definition.input_settings.input_type',
                            inputType,
                        )
                        setValue('definition.data_type', dataType)
                    }}
                    isDisabled={isCustomField(props.field)}
                />
                {!isReadOnly && (
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
                                val,
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
                            isDisabled={isReadOnly}
                            objectType={props.field.object_type}
                        />
                    </div>
                )}

            <div className={css.buttons}>
                <div className={css.leftGroup}>
                    {isReadOnly ? (
                        <Button
                            intent="secondary"
                            onClick={props.onClose}
                            leadingIcon="arrow_back"
                        >
                            Return to {customFieldTitleLabel} Fields
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
                                disabled={
                                    !isFormDirty ||
                                    props.field.object_type ===
                                        OBJECT_TYPES.CUSTOMER
                                }
                                target={SAVE_BUTTON_ID}
                            >
                                {TOOLTIP_MESSAGE}
                            </Tooltip>
                        </>
                    )}
                </div>

                {isCustomField(props.field) && !isReadOnly && (
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
                                    customFieldLabel={props.field.label}
                                    isOpen={archiveModalVisible}
                                    onConfirm={async () => {
                                        await handleArchivingCustomField(true)
                                        setArchiveModalVisible(false)
                                    }}
                                    onClose={() =>
                                        setArchiveModalVisible(false)
                                    }
                                    objectType={props.field.object_type}
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
                    shouldRedirectAfterSave
                />
            )}
        </form>
    )
}
