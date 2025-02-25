import React from 'react'

import { useUpdateCustomFieldDefinition } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinition'
import { CustomField, CustomFieldInput } from 'custom-fields/types'
import history from 'pages/history'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import FieldForm from './FieldForm'

interface EditFieldFormProps {
    field: CustomField
}

export default function EditFieldForm(props: EditFieldFormProps) {
    const { mutateAsync } = useUpdateCustomFieldDefinition()

    const close = () =>
        history.push(
            `/app/settings/${CUSTOM_FIELD_ROUTES[props.field.object_type]}`,
        )
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
