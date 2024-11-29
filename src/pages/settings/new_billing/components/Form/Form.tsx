import React from 'react'

import {
    FieldValues,
    FormProvider,
    SubmitErrorHandler,
    SubmitHandler,
    useForm,
    UseFormProps,
} from 'react-hook-form'

export function Form<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues extends FieldValues | undefined = undefined,
>({
    children,
    onValidSubmit,
    onInvalidSubmit,
    className,
    ...props
}: React.PropsWithChildren<
    UseFormProps<TFieldValues, TContext> & {
        onValidSubmit: TTransformedValues extends undefined
            ? SubmitHandler<TFieldValues>
            : TTransformedValues extends FieldValues
              ? SubmitHandler<TTransformedValues>
              : never
        onInvalidSubmit?: SubmitErrorHandler<TFieldValues>
        className?: string
    }
>) {
    const methods = useForm(props)

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onValidSubmit, onInvalidSubmit)}
                className={className}
            >
                {children}
            </form>
        </FormProvider>
    )
}
