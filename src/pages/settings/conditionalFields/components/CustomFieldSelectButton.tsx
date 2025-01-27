import {
    SelectInput,
    type SelectInputTriggerProps,
} from '@gorgias/merchant-ui-kit'
import React, {useMemo} from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    CustomFieldObjectTypes,
    CustomFieldRequirementType,
    isCustomFieldAIManagedType,
} from 'custom-fields/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'

const SelectTrigger = ({
    hasError: __hasError,
    isOpen,
    setRef,
    value: __value,
    ...buttonProps
}: SelectInputTriggerProps) => (
    <Button
        {...buttonProps}
        ref={setRef}
        trailingIcon={isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
    >
        Add Ticket Field
    </Button>
)

type CustomFieldSelectButtonProps = {
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
    const customFields = useCustomFieldDefinitions(
        {
            archived: false,
            object_type: objectType,
        },
        {refetchOnWindowFocus: 'always'}
    )

    const options = useMemo(
        () =>
            (customFields.data?.data || [])
                .filter(
                    ({managed_type}) =>
                        !isCustomFieldAIManagedType(managed_type)
                )
                .filter(({id}) => !ignoreIds?.includes(id)),

        [customFields.data?.data, ignoreIds]
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
        <SelectInput
            onChange={(value) => {
                onSelect(value.id)
            }}
            options={options}
            optionMapper={(option) => ({
                value: option?.label,
                subtext: requirementTypeToString(option?.requirement_type),
            })}
            trigger={SelectTrigger}
        />
    )
}
