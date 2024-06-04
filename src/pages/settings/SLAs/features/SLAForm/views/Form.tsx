import React, {isValidElement, ReactElement} from 'react'
import {DefaultValues, FieldValues, useForm} from 'react-hook-form'

import FormSubmitButton from './FormSubmitButton'

type Child = ReactElement<{fieldName?: string; children: Child[]}>

export default function Form<T extends FieldValues>({
    children,
    defaultValues,
    values,
    onSubmit,
}: {
    children: Child[]
    values?: T
    defaultValues?: DefaultValues<T>
    onSubmit: (data: T) => void
}) {
    const form = useForm<T>({
        defaultValues,
        values,
    })

    const {control, handleSubmit} = form

    const handleFormSubmit = (data: T) => {
        onSubmit(data)
    }

    const registerControls = (children: Child[]) => {
        return React.Children.map(children, (child): JSX.Element => {
            return isValidElement(child)
                ? child.props.fieldName
                    ? React.createElement(child.type, {
                          ...{
                              ...child.props,
                              control,
                              key: child.props.fieldName,
                          },
                      })
                    : child.props.children
                    ? React.cloneElement(child, {
                          ...child.props,
                          children: registerControls(child.props.children),
                      })
                    : child.type === FormSubmitButton
                    ? React.createElement(child.type, {
                          ...child.props,
                          control,
                      })
                    : child
                : child
        })
    }
    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            {registerControls(children)}
        </form>
    )
}
