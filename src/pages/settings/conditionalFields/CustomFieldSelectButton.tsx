import {SelectInput} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useMemo} from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    CustomField,
    CustomFieldObjectTypes,
    CustomFieldRequirementType,
    isCustomFieldAIManagedType,
} from 'custom-fields/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import css from './CustomFieldSelectButton.less'

interface CustomFieldSelectButtonProps {
    objectType: CustomFieldObjectTypes
    ignoreIds?: number[]
    onSelect: (customFieldId: number) => void
    className?: string
}

function requirementTypeToString(
    requirementType?: CustomFieldRequirementType
): string {
    if (requirementType === 'conditional') {
        return 'Conditional visibility'
    }
    if (requirementType === 'required') {
        return 'Required: Always Visible'
    }
    return 'Optional: Always Visible'
}

export default function CustomFieldSelectButton({
    objectType,
    ignoreIds,
    onSelect,
}: CustomFieldSelectButtonProps) {
    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: objectType,
    })

    const optionsMap = useMemo(
        () =>
            customFields.data?.data
                .filter(
                    ({managed_type}) =>
                        !isCustomFieldAIManagedType(managed_type)
                )
                .filter(({id}) => !ignoreIds?.includes(id))
                .reduce(
                    (ret, field) => {
                        ret[String(field.id)] = field
                        return ret
                    },
                    {} as {[id: string]: CustomField}
                ),
        [customFields.data?.data, ignoreIds]
    )
    const options = useMemo(
        () => (optionsMap ? Object.keys(optionsMap) : []),
        [optionsMap]
    )
    const optionMapper = useCallback(
        (id: string) => {
            const customField = optionsMap![id]
            return {
                value: customField?.label,
                subtext: requirementTypeToString(customField?.requirement_type),
            }
        },
        [optionsMap]
    )

    if (customFields.isLoading) {
        return null
    }

    if (!options.length) {
        return (
            <Alert icon type={AlertType.Warning}>
                All the possible custom fields have been set.
            </Alert>
        )
    }

    return (
        <div className={css.select}>
            <SelectInput
                onChange={(value) => onSelect?.(parseInt(value, 10))}
                options={options}
                optionMapper={optionMapper}
            />
        </div>
    )
}
