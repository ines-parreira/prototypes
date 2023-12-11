import React, {ComponentProps, useMemo} from 'react'

import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import SelectField from 'pages/common/forms/SelectField/SelectField'

type Props = Pick<
    ComponentProps<typeof SelectField>,
    'container' | 'className'
> & {
    onChange: (value: number) => void
    value: number | null
    required?: boolean // Override because SelectField['required'] is not optional
}

/**
 * Small wrapper around <SelectField/> to inject the possible custom fields as options.
 */
const CustomFieldSelect = ({onChange, ...props}: Props) => {
    // Load all active ticket fields
    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: 'Ticket',
    })

    // Map the ticket fields to a format understandable by <SelectField/>
    const customFieldOptions = useMemo(() => {
        return customFields.data?.data.map(({id, label}) => ({
            value: id,
            label,
        }))
    }, [customFields])

    return (
        <SelectField
            {...props}
            onChange={(value) => onChange(value as number)}
            options={customFieldOptions}
        />
    )
}

export default CustomFieldSelect
