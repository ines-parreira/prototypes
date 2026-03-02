import React, { useMemo } from 'react'

import {
    LegacyButton as Button,
    LegacySelectField as SelectField,
} from '@gorgias/axiom'
import type { LegacySelectFieldTriggerProps as SelectFieldTriggerProps } from '@gorgias/axiom'
import type { RequirementType } from '@gorgias/helpdesk-queries'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField, CustomFieldObjectTypes } from 'custom-fields/types'
import { isCustomFieldAIManagedType } from 'custom-fields/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

const SelectTrigger = ({
    hasError: __hasError,
    isOpen,
    setRef,
    value: __value,
    ...buttonProps
}: SelectFieldTriggerProps) => (
    <Button
        {...buttonProps}
        ref={setRef}
        intent="secondary"
        isDisabled={buttonProps['disabled']}
        trailingIcon={isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
    >
        Add Ticket Field
    </Button>
)

type CustomFieldSelectButtonProps = {
    objectType: CustomFieldObjectTypes
    ignoreIds?: number[]
    onSelect: (customField: CustomField) => void
    isDisabled?: boolean
    className?: string
}

function requirementTypeToString(requirementType?: RequirementType): string {
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
    isDisabled,
}: CustomFieldSelectButtonProps) {
    const { data: { data: customFields = [] } = {}, isLoading } =
        useCustomFieldDefinitions(
            {
                archived: false,
                object_type: objectType,
            },
            { query: { refetchOnWindowFocus: 'always' } },
        )

    const options = useMemo(
        () =>
            customFields
                .filter(
                    ({ managed_type }) =>
                        !isCustomFieldAIManagedType(managed_type ?? null),
                )
                .filter(({ id }) => !ignoreIds?.includes(id)),

        [customFields, ignoreIds],
    )

    if (isLoading) {
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
        <SelectField
            onChange={onSelect}
            options={options}
            optionMapper={(option) => ({
                value: option?.label,
                subtext: requirementTypeToString(option?.requirement_type),
            })}
            selectedOption={null as any}
            trigger={SelectTrigger}
            isDisabled={isDisabled}
            dropdownMaxWidth={320}
        />
    )
}
