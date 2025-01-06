import React, {ComponentProps, ComponentType} from 'react'
import {
    useController,
    ControllerRenderProps,
    UseControllerProps,
} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'

type ControllerParams = {
    name: string
    // so we can access it for the controller
    isRequired?: unknown
    validation?: Omit<
        UseControllerProps['rules'],
        'onBlur' | 'onChange' | 'value' | 'shouldUnregister' | 'deps'
    >
}

type FormFieldProps<CustomFieldProps> = ControllerParams & {
    field?: ComponentType<CustomFieldProps>
    // onChange, onBlur, value, etc. are handled by the controller
    // we might want to allow some overrides in the future
} & Omit<CustomFieldProps, keyof ControllerRenderProps>

export default function FormField<
    CustomFieldProps = ComponentProps<typeof InputField>,
>({
    name,
    field: Field = InputField,
    validation,
    ...fieldProps
}: FormFieldProps<CustomFieldProps>) {
    const {field: controllerFieldProps, fieldState} = useController({
        name,
        rules: {
            required: fieldProps.isRequired
                ? 'This field is required'
                : undefined,
            ...validation,
        },
    })

    return (
        <Field
            {...(fieldProps as CustomFieldProps)}
            {...controllerFieldProps}
            error={fieldState.error?.message}
        />
    )
}
