import React from 'react'

import {
    FieldValues,
    Path,
    useController,
    UseControllerProps,
} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'

export type IFormInputFieldProps<
    TFieldName extends Path<TFieldValues>,
    TFieldValues extends FieldValues,
> = {
    name: TFieldName
    isRequired?: boolean
    rules?: UseControllerProps<TFieldValues, TFieldName>['rules']
    transform?: (value: string) => string
} & React.ComponentProps<typeof InputField>

export function FormInputField<
    TFieldName extends Path<TFieldValues>,
    TFieldValues extends FieldValues,
>({
    name,
    rules,
    transform,
    ...inputProps
}: IFormInputFieldProps<TFieldName, TFieldValues>) {
    const { field, fieldState } = useController({
        name,
        rules,
    })

    return (
        <InputField
            {...inputProps}
            {...field}
            isDisabled={field.disabled}
            error={fieldState.error?.message}
            onChange={
                transform
                    ? (nextValue) => field.onChange(transform(nextValue))
                    : field.onChange
            }
        />
    )
}
