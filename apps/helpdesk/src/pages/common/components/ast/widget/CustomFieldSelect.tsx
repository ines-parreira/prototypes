import type { ComponentProps } from 'react'
import { useEffect, useMemo } from 'react'

import type { ObjectType } from '@gorgias/helpdesk-types'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { isCustomFieldAIManagedType } from 'custom-fields/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import SelectField from 'pages/common/forms/SelectField/SelectField'

type Props = Pick<
    ComponentProps<typeof SelectField>,
    'container' | 'className'
> & {
    onChange?: (value: number) => void
    value: number | null
    required?: boolean // Override because SelectField['required'] is not optional
    idsAlreadySet?: number[]
    viewMode?: boolean
    showManagedFields?: boolean
    objectType?: ObjectType
}

/**
 * Small wrapper around <SelectField/> to inject the possible custom fields as options.
 */
const CustomFieldSelect = ({
    onChange,
    viewMode,
    showManagedFields = false,
    objectType = 'Ticket',
    ...props
}: Props) => {
    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: objectType,
    })

    const activeCustomFields = useMemo(() => {
        return (
            customFields.data?.data.filter(
                (field) => !field.deactivated_datetime,
            ) || []
        )
    }, [customFields.data?.data])

    // Map the ticket fields to a format understandable by <SelectField/>
    const customFieldOptions = useMemo(() => {
        return (
            activeCustomFields
                .filter(
                    ({ managed_type }) =>
                        showManagedFields ||
                        !isCustomFieldAIManagedType(managed_type ?? null),
                )
                .map(({ id, label }) => ({
                    value: id,
                    label,
                }))
                .filter(
                    ({ value }) =>
                        value === props.value ||
                        !props.idsAlreadySet?.includes(value),
                ) || []
        )
    }, [
        activeCustomFields,
        showManagedFields,
        props.idsAlreadySet,
        props.value,
    ])

    useEffect(() => {
        if (!props.value && customFieldOptions.length) {
            onChange?.(customFieldOptions[0].value)
        }
    }, [props.value, customFieldOptions, onChange])

    if (customFields.isLoading) {
        return null
    }

    if (viewMode) {
        const customField = customFields.data?.data.find(
            (field) => field.id === props.value,
        )
        return (
            <strong>
                {Boolean(customField?.deactivated_datetime) ? '(Archived)' : ''}{' '}
                {customField?.label || ''}:{customField?.required && ' *'}
            </strong>
        )
    }

    if (!customFieldOptions.length) {
        return (
            <Alert icon type={AlertType.Warning}>
                All the possible custom fields have been set.
            </Alert>
        )
    }

    return (
        <SelectField
            {...props}
            onChange={(value) => onChange?.(value as number)}
            options={customFieldOptions}
            showSelectedOption={customFieldOptions.length === 1}
        />
    )
}

export default CustomFieldSelect
