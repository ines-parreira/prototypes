import React, {ComponentProps} from 'react'
import {Control, useFormState} from 'react-hook-form'

import Button from 'pages/common/components/button/Button'
import {MappedFormSLAPolicy} from 'pages/settings/SLAs/features/SLAForm/controllers/makeMappedFormSLAPolicy'

type FormSubmitButtonProps = {
    control?: Control<MappedFormSLAPolicy>
} & ComponentProps<typeof Button>

export default function FormSubmitButton({
    control,
    ...buttonProps
}: FormSubmitButtonProps) {
    const {isDirty} = useFormState({control})

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
