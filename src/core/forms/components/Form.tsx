import React, {PropsWithChildren} from 'react'
import {
    FieldValues,
    FormProvider,
    useForm,
    UseFormHandleSubmit,
    UseFormProps,
} from 'react-hook-form'

import {
    FormErrors,
    FormValidator,
    createResolver,
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
                onSubmit={methods.handleSubmit(onValidSubmit, onInvalidSubmit)}
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
    React.DetailedHTMLProps<
        React.FormHTMLAttributes<HTMLFormElement>,
        HTMLFormElement
    >,
    'onSubmit' | 'noValidate'
>
