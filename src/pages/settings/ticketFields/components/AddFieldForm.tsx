import React from 'react'
import {useDispatch} from 'react-redux'

import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {CustomFieldInput} from 'models/customField/types'
import {createCustomField} from 'models/customField/resources'
import history from 'pages/history'
import FieldForm from './FieldForm'

interface AddFieldFormProps {
    entityType: CustomFieldInput['entity_type']
    order: number
}

export default function AddFieldForm(props: AddFieldFormProps) {
    const dispatch = useDispatch()

    const newField: CustomFieldInput = {
        entity_type: props.entityType,
        name: '',
        order: props.order,
        value_required: false,
        value_type_settings: {
            type: 'text',
        },
    }

    const close = () => history.push('/app/settings/ticket-fields')
    const handleSubmit = async (field: CustomFieldInput) => {
        await createCustomField(field)
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'Ticket field created successfully.',
            })
        )
        close()
    }

    return (
        <FieldForm field={newField} onSubmit={handleSubmit} onCancel={close} />
    )
}
