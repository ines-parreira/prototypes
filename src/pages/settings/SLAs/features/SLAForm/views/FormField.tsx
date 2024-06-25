import React, {cloneElement, ComponentType, createElement} from 'react'
import {useController, ControllerRenderProps} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'

type FormFieldProps<P> = {
    fieldName: string
    label?: string
    className?: string
    isRequired?: boolean
    field?: ComponentType<P>
} & Omit<P, Extract<keyof ControllerRenderProps, keyof P>>

export default function FormField<P>({
    fieldName,
    label,
    className,
    isRequired,
    field,
    ...fieldProps
}: FormFieldProps<P>) {
    const {field: formFieldProps, fieldState} = useController({
        name: fieldName,
    })

    return field ? (
        cloneElement(createElement(field as ComponentType), {
            ...fieldProps,
            ...formFieldProps,
            label,
            className,
            error: fieldState.error?.message,
        })
    ) : (
        <InputField
            {...formFieldProps}
            label={label}
            className={className}
            isRequired={isRequired}
            error={fieldState.error?.message}
        />
    )
}
