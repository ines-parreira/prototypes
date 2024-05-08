import React, {cloneElement, ComponentType, createElement} from 'react'
import {useController, Control, ControllerRenderProps} from 'react-hook-form'
import InputField from 'pages/common/forms/input/InputField'

type FormFieldProps<P> = {
    fieldName: string
    label?: string
    className?: string
    isRequired?: boolean
    control?: Control
    field?: ComponentType<P>
} & Omit<P, Extract<keyof ControllerRenderProps, keyof P>>

export default function FormField<P>({
    fieldName,
    label,
    className,
    isRequired,
    control,
    field,
    ...fieldProps
}: FormFieldProps<P>) {
    const {field: formFieldProps} = useController({
        name: fieldName,
        control,
    })

    return field ? (
        cloneElement(createElement(field as ComponentType), {
            ...fieldProps,
            ...formFieldProps,
            label,
            className,
        })
    ) : (
        <InputField
            {...formFieldProps}
            label={label}
            className={className}
            isRequired={isRequired}
        />
    )
}
