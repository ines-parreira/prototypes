import React, {cloneElement, ComponentType, createElement} from 'react'
import {
    useController,
    ControllerRenderProps,
    UseControllerProps,
} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'

type FormFieldProps<P> = {
    name: string
    label?: string
    className?: string
    isRequired?: boolean
    isDisabled?: boolean
    caption?: React.ReactNode
    validation?: ValidationRules
    field?: ComponentType<P>
} & Omit<P, Extract<keyof ControllerRenderProps, keyof P>>

type ValidationRules = Omit<
    UseControllerProps['rules'],
    'onBlur' | 'onChange' | 'value' | 'shouldUnregister' | 'deps'
>

export default function FormField<P>({
    name,
    label,
    className,
    isRequired,
    isDisabled,
    field,
    caption,
    validation,
    ...fieldProps
}: FormFieldProps<P>) {
    const {field: formFieldProps, fieldState} = useController({
        name,
        rules: {
            required: isRequired ? 'This field is required' : undefined,
            ...validation,
        },
    })

    return field ? (
        cloneElement(createElement(field as ComponentType), {
            ...fieldProps,
            ...formFieldProps,
            label,
            className,
            isDisabled,
            caption,
            error: fieldState.error?.message,
        })
    ) : (
        <InputField
            {...formFieldProps}
            label={label}
            className={className}
            isRequired={isRequired}
            isDisabled={isDisabled}
            caption={caption}
            error={fieldState.error?.message}
        />
    )
}
