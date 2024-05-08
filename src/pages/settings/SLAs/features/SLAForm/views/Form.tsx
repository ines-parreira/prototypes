import React, {isValidElement, ReactElement} from 'react'
import {useForm} from 'react-hook-form'

import {MappedFormSLAPolicy} from '../controllers/makeMappedFormSLAPolicy'

import FormSubmitButton from './FormSubmitButton'

type Child = ReactElement<{fieldName?: string; children: Child[]}>

export default function Form({
    children,
    defaultValues,
    onSubmit,
}: {
    children: Child[]
    defaultValues?: Record<string, unknown>
    onSubmit: (data: MappedFormSLAPolicy) => void
}) {
    const form = useForm<MappedFormSLAPolicy>({
        defaultValues,
    })

    const {control, handleSubmit} = form

    const handleFormSubmit = (data: MappedFormSLAPolicy) => {
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
