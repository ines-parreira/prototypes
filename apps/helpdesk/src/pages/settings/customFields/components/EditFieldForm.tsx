import { history } from '@repo/routing'

import { UpdateCustomField } from '@gorgias/helpdesk-types'

import { useUpdateCustomFieldDefinition } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinition'
import { CustomField, CustomFieldInput } from 'custom-fields/types'
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

    const handleSubmit = (field: CustomFieldInput) => {
        return mutateAsync({
            id: props.field.id,
            data: field as UpdateCustomField,
        })
    }

    return (
        <FieldForm
            field={props.field}
            onSubmit={handleSubmit}
            onClose={close}
        />
    )
}
