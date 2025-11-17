import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'

import type { CreateCustomField } from '@gorgias/helpdesk-types'

import { useCreateCustomFieldDefinition } from 'custom-fields/hooks/queries/useCreateCustomFieldDefinition'
import type {
    CustomFieldInput,
    CustomFieldObjectTypes,
} from 'custom-fields/types'
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

        return mutateAsync({ data: field as CreateCustomField })
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
