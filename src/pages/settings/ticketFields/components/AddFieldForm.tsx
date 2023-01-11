import React from 'react'
import {useDispatch} from 'react-redux'

import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {GorgiasApiError} from 'models/api/types'
import {CustomFieldInput} from 'models/customField/types'
import {createCustomField} from 'models/customField/resources'
import history from 'pages/history'
import {errorToChildren} from 'utils'
import FieldForm from './FieldForm'

interface AddFieldFormProps {
    objectType: CustomFieldInput['object_type']
}

export default function AddFieldForm(props: AddFieldFormProps) {
    const dispatch = useDispatch()

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
        try {
            await createCustomField(field)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Ticket field created successfully.',
                })
            )
            close()
        } catch (error) {
            const err = error as GorgiasApiError
            void dispatch(
                notify({
                    title: err.response.data.error.msg,
                    message: errorToChildren(err)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    return (
        <FieldForm field={newField} onSubmit={handleSubmit} onCancel={close} />
    )
}
