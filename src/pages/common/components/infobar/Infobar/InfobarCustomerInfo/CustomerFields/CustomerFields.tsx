import React from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'

import css from './CustomerFields.less'
import {Heading} from './Heading'

export default function CustomerFields() {
    const isCustomerFieldsEnabled = useFlag(
        FeatureFlagKey.CustomerFields,
        false
    )
    const {data, isLoading, isError} = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.CUSTOMER,
    })

    if (
        !isCustomerFieldsEnabled ||
        isLoading ||
        isError ||
        data.data.length === 0
    ) {
        return null
    }

    const customFields = data.data

    return (
        <div className={css.customerFieldsContainer}>
            <Heading />
            {customFields.map((field) => {
                return (
                    <div key={field.id} className={css.field}>
                        <div className={css.fieldLabel}>{field.label}</div>
                    </div>
                )
            })}
        </div>
    )
}
