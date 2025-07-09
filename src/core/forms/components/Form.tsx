import type {
    DetailedHTMLProps,
    FormHTMLAttributes,
    PropsWithChildren,
} from 'react'

import {
    FieldValues,
    FormProvider,
    useForm,
    UseFormHandleSubmit,
    UseFormProps,
} from 'react-hook-form'

import {
    createResolver,
    FormErrors,
    FormValidator,
    toFieldErrors,
} from '../utils/validation'

export type FormProps<TFieldValues extends FieldValues> = PropsWithChildren<
    Omit<UseFormProps<TFieldValues>, 'resolver' | 'errors'> &
        HandleSubmitProps<TFieldValues> &
        FormElementProps & {
            validator?: FormValidator<TFieldValues>
            errors?: FormErrors<TFieldValues>
        }
>

export function Form<TFieldValues extends FieldValues>({
    children,
    validator,
    onValidSubmit,
    onInvalidSubmit,
    errors,
    defaultValues,
    ...props
}: FormProps<TFieldValues>) {
    const resolver = validator
        ? createResolver<TFieldValues>(validator)
        : undefined

    const methods = useForm({
        resolver,
        defaultValues,
        errors: errors ? toFieldErrors(errors) : undefined,
        ...props,
    })

    return (
        <FormProvider {...methods}>
            <form
                aria-label="form"
                noValidate
                {...props}
                onSubmit={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    methods.handleSubmit(onValidSubmit, onInvalidSubmit)(e)
                }}
            >
                {children}
            </form>
        </FormProvider>
    )
}

type HandleSubmitProps<TFieldValues extends FieldValues> = {
    onValidSubmit: Parameters<UseFormHandleSubmit<TFieldValues>>[0]
    onInvalidSubmit?: Parameters<UseFormHandleSubmit<TFieldValues>>[1]
}

type FormElementProps = Omit<
    DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>,
    'onSubmit' | 'noValidate'
>
