import React from 'react'
import {useDispatch} from 'react-redux'

import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {CustomField, CustomFieldInput} from 'models/customField/types'
import {updateCustomField} from 'models/customField/resources'
import history from 'pages/history'
import FieldForm from './FieldForm'

interface EditFieldFormProps {
    field: CustomField
}

export default function EditFieldForm(props: EditFieldFormProps) {
    const dispatch = useDispatch()

    const close = () => history.push('/app/settings/ticket-fields')
    const reloadPage = () => window.location.reload()
    const handleSubmit = async (field: CustomFieldInput) => {
        await updateCustomField(props.field.id, field)
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'Ticket field updated successfully.',
            })
        )
        close()
    }

    return (
        <FieldForm
            field={props.field}
            onSubmit={handleSubmit}
            onCancel={close}
            onFieldChange={reloadPage}
        />
    )
}
