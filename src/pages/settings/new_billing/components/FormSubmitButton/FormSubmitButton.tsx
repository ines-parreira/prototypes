import React from 'react'

import {useFormState} from 'react-hook-form'

import Button from 'pages/common/components/button/Button'

import {FormSubmitButtonError} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButtonError'

import css from './FormSubmitButton.less'

export function FormSubmitButton({children}: React.PropsWithChildren<object>) {
    const {isSubmitting} = useFormState()

    return (
        <div>
            <Button
                className={css.submitButton}
                type="submit"
                intent="primary"
                isLoading={isSubmitting}
            >
                {children}
            </Button>
            <FormSubmitButtonError />
        </div>
    )
}
