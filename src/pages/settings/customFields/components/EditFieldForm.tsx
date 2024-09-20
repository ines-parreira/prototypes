import React from 'react'

import {CustomField, CustomFieldInput} from 'models/customField/types'
import history from 'pages/history'
import {useUpdateCustomFieldDefinition} from 'hooks/customField/useUpdateCustomFieldDefinition'

import FieldForm from './FieldForm'

interface EditFieldFormProps {
    field: CustomField
}

export default function EditFieldForm(props: EditFieldFormProps) {
    const {mutateAsync} = useUpdateCustomFieldDefinition()

    const close = () => history.push('/app/settings/ticket-fields')
    const handleSubmit = async (field: CustomFieldInput) => {
        await mutateAsync([props.field.id, field])
    }

    return (
        <FieldForm
            field={props.field}
            onSubmit={handleSubmit}
            onClose={close}
        />
    )
}
