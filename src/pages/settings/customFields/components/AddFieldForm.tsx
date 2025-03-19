import { logEvent, SegmentEvent } from 'common/segment'
import { useCreateCustomFieldDefinition } from 'custom-fields/hooks/queries/useCreateCustomFieldDefinition'
import { CustomFieldInput, CustomFieldObjectTypes } from 'custom-fields/types'
import history from 'pages/history'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import FieldForm from './FieldForm'

export default function AddFieldForm({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const { mutateAsync } = useCreateCustomFieldDefinition()

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
        logEvent(SegmentEvent.CustomFieldSaveNewFieldClicked, {
            fieldType: field.definition.input_settings.input_type,
            objectType,
        })

        await mutateAsync([field])
    }

    return (
        <FieldForm
            field={newField}
            onSubmit={handleSubmit}
            onClose={close}
            submitLabel="Create field"
        />
    )
}
