import React, {ReactElement, useMemo} from 'react'
import {
    DefaultValues,
    FieldValues,
    FormProvider,
    useForm,
} from 'react-hook-form'
import {
    FormErrors,
    FormValidator,
    createResolver,
    toFieldErrors,
} from './validation'

type FormProps<V extends FieldValues> = {
    children: Child | Child[]
    values?: V
    defaultValues?: DefaultValues<V>
    validator?: FormValidator<V>
    errors?: FormErrors<V>
    onSubmit: (data: V) => void
}
type Child = ReactElement<{name?: string; children: Child[]}>

export default function Form<V extends FieldValues>({
    children,
    defaultValues,
    values,
    onSubmit,
    validator,
    errors,
}: FormProps<V>) {
    const resolver = useMemo(
        () => (validator ? createResolver<V>(validator) : undefined),
        [validator]
    )

    const form = useForm<V>({
        defaultValues,
        values,
        resolver,
        errors: errors ? toFieldErrors(errors) : undefined,
    })

    const {handleSubmit} = form

    const handleFormSubmit = (data: V) => {
        onSubmit(data)
    }

    return (
        <FormProvider {...form}>
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                noValidate
                aria-label="form"
            >
                {children}
            </form>
        </FormProvider>
    )
}
