import React, {ComponentProps, useEffect, useMemo} from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
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
}

/**
 * Small wrapper around <SelectField/> to inject the possible custom fields as options.
 */
const CustomFieldSelect = ({onChange, viewMode, ...props}: Props) => {
    // Load all ticket fields, active or not
    const customFields = useCustomFieldDefinitions({
        archived: undefined,
        object_type: 'Ticket',
    })

    const activeCustomFields = useMemo(() => {
        return (
            customFields.data?.data.filter(
                (field) => !field.deactivated_datetime
            ) || []
        )
    }, [customFields.data?.data])

    // Map the ticket fields to a format understandable by <SelectField/>
    const customFieldOptions = useMemo(() => {
        return (
            activeCustomFields
                .map(({id, label}) => ({
                    value: id,
                    label,
                }))
                .filter(
                    ({value}) =>
                        value === props.value ||
                        !props.idsAlreadySet?.includes(value)
                ) || []
        )
    }, [activeCustomFields, props.idsAlreadySet, props.value])

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
            (field) => field.id === props.value
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
