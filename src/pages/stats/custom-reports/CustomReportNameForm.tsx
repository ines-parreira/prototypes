import React from 'react'
import {SubmitHandler, useController, useForm} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'
import css from 'pages/stats/custom-reports/CustomReportNameInput.less'
import {EmojiInput} from 'pages/stats/custom-reports/EmojiInput'

export type CustomReportNameFormFieldValues = {
    name: string
    emoji?: string | null
}

export type CustomReportNameFormSubmitHandler = (
    fieldValues: CustomReportNameFormFieldValues
) => Promise<unknown>

export type CustomReportNameFormProps = {
    onSubmit: CustomReportNameFormSubmitHandler
    initialValues?: Partial<CustomReportNameFormFieldValues>
    id?: string
    isError?: boolean
}

export const DEFAULT_ERROR_MESSAGE = 'Oops! Something went wrong.'

export const CustomReportNameForm = ({
    id,
    onSubmit,
    initialValues = {},
    isError,
}: CustomReportNameFormProps) => {
    const form = useForm<CustomReportNameFormFieldValues>({
        defaultValues: {
            name: initialValues.name ?? '',
            emoji: initialValues.emoji ?? '',
        },
        mode: initialValues.name ? 'onChange' : undefined,
    })

    const nameController = useController<CustomReportNameFormFieldValues>({
        name: 'name',
        control: form.control,
        rules: {required: true, minLength: 3, maxLength: 255},
    })

    const emojiController = useController<CustomReportNameFormFieldValues>({
        name: 'emoji',
        control: form.control,
    })

    const handleSubmit: SubmitHandler<CustomReportNameFormFieldValues> = (
        formData
    ) => {
        return onSubmit(formData).catch(() => {
            form.setError('root', {message: DEFAULT_ERROR_MESSAGE})
        })
    }

    const isInvalid =
        !!form.formState.errors.name ||
        !!form.formState.errors.emoji ||
        !!form.formState.errors.root

    return (
        <form
            id={id}
            onSubmit={form.handleSubmit(handleSubmit)}
            className={css.customReportNameInput}
        >
            <InputField
                type="text"
                aria-label="Report name"
                name={nameController.field.name}
                placeholder="Add report name"
                className={css.inputField}
                ref={nameController.field.ref}
                value={nameController.field.value as string}
                onChange={nameController.field.onChange}
                error={isError || isInvalid}
                prefix={
                    <EmojiInput
                        name={emojiController.field.name}
                        value={emojiController.field.value as string}
                        onChange={emojiController.field.onChange}
                        className={css.emojiSelect}
                    />
                }
            />
        </form>
    )
}
