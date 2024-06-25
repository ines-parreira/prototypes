import React, {ComponentProps} from 'react'
import {useFormState} from 'react-hook-form'

import Button from 'pages/common/components/button/Button'

export default function FormSubmitButton({
    ...buttonProps
}: ComponentProps<typeof Button>) {
    const {isDirty} = useFormState()

    return (
        <Button
            intent="primary"
            type="submit"
            isDisabled={!isDirty}
            {...buttonProps}
        >
            Save Changes
        </Button>
    )
}
