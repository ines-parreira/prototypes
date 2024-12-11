import React from 'react'

import {useFormState} from 'react-hook-form'

import Button from 'pages/common/components/button/Button'

import {FormSubmitButtonError} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButtonError'

export function FormSubmitButton({
    children,
    className,
}: React.PropsWithChildren<{className?: string}>) {
    const {isSubmitting} = useFormState()

    return (
        <div className={className}>
            <Button type="submit" intent="primary" isLoading={isSubmitting}>
                {children}
            </Button>
            <FormSubmitButtonError />
        </div>
    )
}
