import React from 'react'

import {CustomField, CustomFieldInput} from 'models/customField/types'
import history from 'pages/history'
import {useUpdateCustomField} from 'models/customField/queries'
import FieldForm from './FieldForm'

interface EditFieldFormProps {
    field: CustomField
}

export default function EditFieldForm(props: EditFieldFormProps) {
    const {mutateAsync} = useUpdateCustomField(props.field.id)

    const close = () => history.push('/app/settings/ticket-fields')
    const handleSubmit = async (field: CustomFieldInput) => {
        await mutateAsync(field)
        close()
    }

    return (
        <FieldForm
            field={props.field}
            onSubmit={handleSubmit}
            onCancel={close}
        />
    )
}
