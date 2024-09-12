import React, {ComponentProps} from 'react'

import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import Loader from 'pages/common/components/Loader/Loader'

import CustomFieldInput from './CustomFieldInput'

type Props = Omit<ComponentProps<typeof CustomFieldInput>, 'customField'> & {
    customFieldId: number
}

/**
 * Wraps a <CustomFieldInput/> but takes a custom field ID rather than a custom field definition.
 */
function CustomFieldIdInput({customFieldId, ...props}: Props) {
    const customField = useCustomFieldDefinition(customFieldId)

    if (customField.isLoading) {
        return <Loader className={props.className} minHeight="0" size="24px" />
    }

    if (!customField.data) {
        return <p className={props.className}>Missing custom field</p>
    }

    return <CustomFieldInput customField={customField.data} {...props} />
}

export default CustomFieldIdInput
