import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {set} from 'lodash'

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

import css from './FieldForm.less'
import TypeSelectInput from './TypeSelectInput'

interface FieldFormProps {
    field: CustomField | CustomFieldInput
    onSubmit: (field: CustomFieldInput) => Promise<void>
    onCancel: () => void
}

export default function FieldForm(props: FieldFormProps) {
    const formRef = useRef<HTMLFormElement>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)
    const [form, setForm] = useState(props.field)

    // Use an effect since useRef() does not notify when the value is set
    useEffect(() => {
        setIsFormValid(formRef.current!.checkValidity() || false)
    }, [form])

    const setValue = (key: string, value: any) => {
        setForm(set({...form}, key, value))
    }

    const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()

        setIsLoading(true)
        try {
            await props.onSubmit(form)
        } catch (e) {
            console.error('Custom field error', e)
        } finally {
            setIsLoading(false)
        }
    }

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
                name="name"
                label="Name"
                value={form.name}
                onChange={(val) => setValue('name', val)}
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
                isChecked={form.value_required}
                onChange={(val) => setValue('value_required', val)}
                className={css.formRow}
            >
                Required to close ticket
            </CheckBox>
            <div className={css.formRow}>
                <Label htmlFor="type" className={css.formLabel} isRequired>
                    Type
                </Label>
                <TypeSelectInput
                    value={form.value_type_settings.type}
                    onChange={(val) =>
                        setValue('value_type_settings.type', val)
                    }
                    isDisabled={isCustomField(props.field)}
                />
                <Caption>
                    Field type can't be changed once it's been saved.
                </Caption>
            </div>
            {form.value_type_settings.type === 'text' && (
                <InputField
                    name="settings.placeholder"
                    label="Placeholder"
                    value={form.value_type_settings.placeholder}
                    onChange={(val) =>
                        setValue('value_type_settings.placeholder', val)
                    }
                    className={css.formRow}
                />
            )}

            <div className={css.buttons}>
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
        </form>
    )
}
