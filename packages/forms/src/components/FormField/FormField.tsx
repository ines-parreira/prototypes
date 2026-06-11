import type { ReactElement } from 'react'

import type { ControllerRenderProps, UseControllerProps } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { FieldProps } from '@gorgias/axiom'

/**
 * The presentational props shared by every `@gorgias/axiom` field component
 * (via its `FieldProps`). FormField forwards them untouched through the render
 * prop so a consumer can declare them once on `<FormField>` and spread the
 * whole field onto the input — no need to repeat them on the child.
 *
 * `value`, `onChange`, `onBlur` and `error` are owned by the controller and so
 * are intentionally excluded here.
 */
type ForwardedFieldProps = Pick<
    FieldProps<unknown>,
    'label' | 'caption' | 'isRequired' | 'isDisabled' | 'isInvalid'
>

/**
 * `ref` is kept so ref-capable (forward-ref) fields can spread it onto their
 * input. React Hook Form relies on it to focus the first invalid field on
 * submit and to honor `setError(..., { shouldFocus: true })`. Plain function
 * components simply ignore the spread ref.
 */
export type FormFieldRenderProps = Omit<ControllerRenderProps, 'onChange'> &
    ForwardedFieldProps & {
        onChange: (value: any) => void
        error?: string
    }

export type FormFieldProps = ForwardedFieldProps & {
    name: string
    validation?: Omit<
        UseControllerProps['rules'],
        'onBlur' | 'onChange' | 'value' | 'shouldUnregister' | 'deps'
    >
    children: (field: FormFieldRenderProps) => ReactElement | null
}

export function FormField({
    name,
    label,
    caption,
    isRequired,
    isDisabled,
    isInvalid,
    validation,
    children,
}: FormFieldProps): ReactElement | null {
    const { field, fieldState } = useController({
        name,
        rules: {
            required: isRequired ? 'This field is required' : undefined,
            ...validation,
        },
    })

    return children({
        ...field,
        label,
        caption,
        isRequired,
        isDisabled,
        isInvalid,
        error: fieldState.error?.message,
    })
}
