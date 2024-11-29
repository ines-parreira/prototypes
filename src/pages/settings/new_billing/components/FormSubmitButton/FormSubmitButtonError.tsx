import React from 'react'

import {useFormContext, useFormState} from 'react-hook-form'

import Caption from 'pages/common/forms/Caption/Caption'

export const FormSubmitButtonError: React.FC = () => {
    const {errors} = useFormState({
        control: useFormContext().control,
    })

    if (errors.address?.message) {
        return <Caption error={errors.address?.message} />
    }

    return null
}
