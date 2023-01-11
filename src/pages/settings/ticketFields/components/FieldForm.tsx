import React, {FormEvent, useCallback, useEffect, useRef, useState} from 'react'
import {set, pick} from 'lodash'

import {
    CustomField,
    CustomFieldInput,
    isCustomField,
} from 'models/customField/types'
import InputField from 'pages/common/forms/input/InputField'
import CheckBox from 'pages/common/forms/CheckBox'
import Label from 'pages/common/forms/Label/Label'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'
import useAppDispatch from 'hooks/useAppDispatch'
import ArchiveConfirmationModal from 'pages/settings/ticketFields/components/ArchiveConfirmationModal'
import {handleArchivingCustomField} from 'pages/settings/ticketFields/utils/handleArchivingCustomField'
import DropdownInput from './DropdownInput'
import TypeSelectInput from './TypeSelectInput'
import css from './FieldForm.less'

interface FieldFormProps {
    field: CustomField | CustomFieldInput
    onSubmit: (field: CustomFieldInput) => Promise<void>
    onCancel: () => void
    onFieldChange?: () => void
}

const pickMap = {
    input: ['placeholder'],
    dropdown: ['choices', 'default'],
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
    const dispatch = useAppDispatch()

    const formRef = useRef<HTMLFormElement>(null)

    const [archiveModalVisible, setArchiveModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)
    const [form, setForm] = useState(props.field)

    // Use an effect since useRef() does not notify when the value is set
    useEffect(() => {
        setIsFormValid(formRef.current!.checkValidity() || false)
    }, [form])

    const setValue = useCallback((key: string, value: any) => {
        setForm((form) => set({...form}, key, value))
    }, [])

    const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()

        setIsLoading(true)
        try {
            await props.onSubmit(sanitizeInput(form))
        } catch (e) {
            console.error('Custom field error', e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleArchivingCustomFieldCallback = useCallback(
        async (id: number, archive: boolean) => {
            setIsLoading(true)
            await handleArchivingCustomField(id, archive, dispatch)
            setIsLoading(false)
        },
        [dispatch]
    )

    const handleChoiceChange = useCallback(
        (val) => setValue('definition.input_settings.choices', val),
        [setValue]
    )

    return (
        <form onSubmit={handleSubmit} ref={formRef}>
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
                value={form.label}
                onChange={(val) => setValue('label', val)}
                className={css.formRow}
                isRequired
            />
            <TextArea
                name="description"
                label="Description"
                caption="Not visible to agents"
                rows={1}
                value={form.description}
                onChange={(val) => setValue('description', val)}
                className={css.formRow}
            />
            <CheckBox
                isChecked={form.required}
                onChange={(val) => setValue('required', val)}
                className={css.formRow}
            >
                Required to close ticket
            </CheckBox>
            <div className={css.formRow}>
                <Label htmlFor="type" className={css.formLabel} isRequired>
                    Type
                </Label>
                <TypeSelectInput
                    value={form.definition.input_settings.input_type}
                    onChange={(val) =>
                        setValue('definition.input_settings.input_type', val)
                    }
                    isDisabled={isCustomField(props.field)}
                />
                <Caption>
                    Field type can't be changed once it's been saved.
                </Caption>
            </div>
            {form.definition.input_settings.input_type === 'input' && (
                <InputField
                    name="settings.placeholder"
                    label="Placeholder"
                    value={form.definition.input_settings.placeholder}
                    onChange={(val) =>
                        setValue('definition.input_settings.placeholder', val)
                    }
                    className={css.formRow}
                />
            )}
            {form.definition.input_settings.input_type === 'dropdown' && (
                <div className={css.formRow}>
                    <Label
                        htmlFor="settings.choices"
                        className={css.formLabel}
                        isRequired
                    >
                        Dropdown choices
                    </Label>
                    <DropdownInput
                        value={form.definition.input_settings.choices}
                        onChange={handleChoiceChange}
                    />
                </div>
            )}

            <div className={css.buttons}>
                <div className={css.leftGroup}>
                    <Button
                        intent="primary"
                        type="submit"
                        isDisabled={!isFormValid}
                        isLoading={isLoading}
                    >
                        Save Changes
                    </Button>
                    <Button intent="secondary" onClick={props.onCancel}>
                        Cancel
                    </Button>
                </div>

                {isCustomField(props.field) && (
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
                                        await handleArchivingCustomFieldCallback(
                                            (props.field as CustomField).id,
                                            true
                                        )
                                        props.onFieldChange?.()
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
                                    await handleArchivingCustomFieldCallback(
                                        (props.field as CustomField).id,
                                        false
                                    )
                                    props.onFieldChange?.()
                                }}
                            >
                                Unarchive field
                            </Button>
                        )}
                    </>
                )}
            </div>
        </form>
    )
}
