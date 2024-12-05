import React, {ComponentProps} from 'react'
import {useFormState} from 'react-hook-form'

import Button from 'pages/common/components/button/Button'

export default function FormSubmitButton({
    ...buttonProps
}: React.PropsWithChildren<Omit<ComponentProps<typeof Button>, 'children'>>) {
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
