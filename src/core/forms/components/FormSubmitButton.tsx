import React from 'react'
import {useFormState} from 'react-hook-form'

import Button, {type ButtonProps} from 'pages/common/components/button/Button'

export type FormSubmitButtonProps = Omit<ButtonProps, 'children'> & {
    children?: React.ReactNode
}

export function FormSubmitButton({...buttonProps}: FormSubmitButtonProps) {
    const {isDirty} = useFormState()

    return (
        <Button
            intent="primary"
            type="submit"
            {...buttonProps}
            isDisabled={buttonProps.isDisabled ?? !isDirty}
        >
            {buttonProps?.children || 'Save Changes'}
        </Button>
    )
}
