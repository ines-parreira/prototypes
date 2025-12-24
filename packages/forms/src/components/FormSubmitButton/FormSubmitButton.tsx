import React from 'react'
import type { ReactNode } from 'react'

import { useFormState } from 'react-hook-form'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonComponentProps as ButtonComponentProps } from '@gorgias/axiom'

export type FormSubmitButtonProps = Omit<ButtonComponentProps, 'children'> & {
    children?: ReactNode
}

export function FormSubmitButton({ ...buttonProps }: FormSubmitButtonProps) {
    const { isDirty } = useFormState()

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
