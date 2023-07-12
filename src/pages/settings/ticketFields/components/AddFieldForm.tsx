import React from 'react'

import {CustomFieldInput} from 'models/customField/types'
import history from 'pages/history'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {useCreateCustomFieldDefinition} from 'hooks/customField/useCreateCustomFieldDefinition'

import FieldForm from './FieldForm'

interface AddFieldFormProps {
    objectType: CustomFieldInput['object_type']
}

export default function AddFieldForm(props: AddFieldFormProps) {
    const {mutateAsync} = useCreateCustomFieldDefinition()

    const newField: CustomFieldInput = {
        object_type: props.objectType,
        label: '',
        required: false,
        managed_type: null,
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
        logEvent(SegmentEvent.CustomFieldTicketSaveNewFieldClicked, {
            fieldType: field.definition.input_settings.input_type,
        })
        await mutateAsync([field])
    }

    return (
        <FieldForm field={newField} onSubmit={handleSubmit} onClose={close} />
    )
}
