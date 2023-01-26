import React from 'react'

import {CustomFieldInput} from 'models/customField/types'
import history from 'pages/history'
import {useCreateCustomField} from 'models/customField/queries'
import FieldForm from './FieldForm'

interface AddFieldFormProps {
    objectType: CustomFieldInput['object_type']
}

export default function AddFieldForm(props: AddFieldFormProps) {
    const {mutateAsync} = useCreateCustomField()

    const newField: CustomFieldInput = {
        object_type: props.objectType,
        label: '',
        required: false,
        definition: {
            data_type: 'text',
            input_settings: {
                input_type: 'dropdown',
                choices: [],
            },
        },
    }

    const close = () => history.push('/app/settings/ticket-fields')
    const handleSubmit = async (field: CustomFieldInput) => {
        await mutateAsync(field)
        close()
    }

    return (
        <FieldForm field={newField} onSubmit={handleSubmit} onCancel={close} />
    )
}
