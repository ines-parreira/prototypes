import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {OBJECT_TYPES} from 'models/customField/constants'
import {
    CustomFieldInput,
    CustomFieldObjectTypes,
} from 'models/customField/types'
import history from 'pages/history'
import {useCreateCustomFieldDefinition} from 'hooks/customField/useCreateCustomFieldDefinition'
import {CUSTOM_FIELD_ROUTES} from 'routes/constants'

import FieldForm from './FieldForm'

export default function AddFieldForm({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const {mutateAsync} = useCreateCustomFieldDefinition()

    const newField: CustomFieldInput = {
        object_type: objectType,
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

    const close = () =>
        history.push(`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}`)
    const handleSubmit = async (field: CustomFieldInput) => {
        if (objectType === OBJECT_TYPES.TICKET) {
            logEvent(SegmentEvent.CustomFieldTicketSaveNewFieldClicked, {
                fieldType: field.definition.input_settings.input_type,
            })
        }
        await mutateAsync([field])
    }

    return (
        <FieldForm
            field={newField}
            onSubmit={handleSubmit}
            onClose={close}
            submitLabel="Create field"
            objectType={objectType}
        />
    )
}
