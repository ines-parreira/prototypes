import React, {ReactElement, useMemo} from 'react'
import {
    DefaultValues,
    FieldValues,
    FormProvider,
    useForm,
} from 'react-hook-form'
import {Validator} from '@gorgias/api-validators'

import formValidationResolver from './formValidationResolver'

type FormProps<T> = {
    children: Child[]
    values?: T
    defaultValues?: DefaultValues<T>
    onSubmit: (data: T) => void
    validator: Validator<T>
}
type Child = ReactElement<{fieldName?: string; children: Child[]}>

export default function Form<T extends FieldValues>({
    children,
    defaultValues,
    values,
    onSubmit,
    validator,
}: FormProps<T>) {
    const resolver = useMemo(
        () => formValidationResolver<T>(validator),
        [validator]
    )

    const form = useForm<T>({
        defaultValues,
        values,
        resolver,
    })

    const {handleSubmit} = form

    const handleFormSubmit = (data: T) => {
        onSubmit(data)
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>{children}</form>
        </FormProvider>
    )
}
