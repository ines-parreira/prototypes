import React, {ComponentProps, ComponentType, useCallback} from 'react'
import {
    useController,
    ControllerRenderProps,
    UseControllerProps,
} from 'react-hook-form'

import InputField from 'pages/common/forms/input/InputField'

// Needed otherwise we can’t access CustomFieldProps value / onChange
//  in the ControllerParams type
type NeededProps = {
    value?: any
    onChange?: any
}

type ControllerParams<CustomFieldProps extends NeededProps> = {
    name: string
    // so we can access it for the controller
    isRequired?: unknown
    validation?: Omit<
        UseControllerProps['rules'],
        'onBlur' | 'onChange' | 'value' | 'shouldUnregister' | 'deps'
    >
    inputTransform?: (value: any) => CustomFieldProps['value']
    outputTransform?: (
        value: Parameters<CustomFieldProps['onChange']>[0]
    ) => any
}

export type FormFieldProps<CustomFieldProps extends NeededProps> = {
    field?: ComponentType<CustomFieldProps>
} & ControllerParams<CustomFieldProps> &
    // onChange, onBlur, value, etc. are handled by the controller
    // we might want to allow some overrides in the future
    Omit<CustomFieldProps, keyof ControllerRenderProps>

export function FormField<
    CustomFieldProps extends NeededProps = ComponentProps<typeof InputField>,
>({
    name,
    field: Field = InputField,
    validation,
    inputTransform,
    outputTransform,
    ...fieldProps
}: FormFieldProps<CustomFieldProps>) {
    const {
        field: {onChange, value, ...controllerFieldProps},
        fieldState,
    } = useController({
        name,
        rules: {
            required: fieldProps.isRequired
                ? 'This field is required'
                : undefined,
            ...validation,
        },
    })

    const handleChange = useCallback(
        (nextValue: unknown) => {
            onChange(outputTransform ? outputTransform(nextValue) : nextValue)
        },
        [onChange, outputTransform]
    )

    return (
        <Field
            {...(fieldProps as unknown as CustomFieldProps)}
            {...controllerFieldProps}
            value={inputTransform ? inputTransform(value) : value}
            error={fieldState.error?.message}
            onChange={handleChange}
        />
    )
}
