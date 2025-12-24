import { useFieldArray, useWatch } from '@repo/forms'

import { Box, Button, Icon } from '@gorgias/axiom'
import type {
    CustomerFieldBranchOption,
    CustomerFieldsConditionalStep,
    CustomField,
} from '@gorgias/helpdesk-types'

import { CustomerLookupActionsFieldItem } from './CustomerLookupActionsFieldItem'
import { useDeleteNode } from './flows/utils/useDeleteNode'

type Props = {
    stepName: string
    onAddOption?: () => void
    branchNextId: string | null
    selectedCustomField?: CustomField
}

export function CustomerLookupActionsFieldArray({
    stepName,
    onAddOption,
    branchNextId,
    selectedCustomField,
}: Props): JSX.Element | null {
    const { fields, append, remove } = useFieldArray({
        name: `${stepName}.branch_options`,
    })
    const { removeUnlinkedSteps } = useDeleteNode()
    const step: CustomerFieldsConditionalStep = useWatch({ name: stepName })

    const handleAddOption = () => {
        const newOption: CustomerFieldBranchOption = {
            field_value: [],
            branch_name: '',
            next_step_id: branchNextId,
        }
        append(newOption)
        onAddOption?.()
    }

    const handleRemoveOption = (index: number) => {
        remove(index)
        removeUnlinkedSteps()
    }

    const inputSettings = selectedCustomField?.definition?.input_settings

    if (!inputSettings || !('choices' in inputSettings)) {
        return null
    }

    const selectedChoicesLength = step.branch_options.reduce(
        (acc, option) =>
            Array.isArray(option.field_value)
                ? acc + Math.max(option.field_value.length, 1)
                : acc + 1,
        0,
    )

    return (
        <Box flexDirection="column" alignItems="flex-start" gap="sm">
            {fields.map((field, index) => {
                const itemName = `${stepName}.branch_options.${index}`

                return (
                    <CustomerLookupActionsFieldItem
                        key={field.id}
                        stepName={stepName}
                        branchNameFieldName={`${itemName}.branch_name`}
                        fieldValueName={`${itemName}.field_value`}
                        onRemove={() => handleRemoveOption(index)}
                        isRemovable
                        fieldValueOptions={inputSettings.choices}
                    />
                )
            })}
            <CustomerLookupActionsFieldItem
                stepName={`${stepName}.default_branch_name`}
            />
            {inputSettings.choices &&
                selectedChoicesLength < inputSettings.choices.length && (
                    <Button
                        variant="secondary"
                        onClick={handleAddOption}
                        leadingSlot={<Icon name="add-plus" />}
                    >
                        Add option
                    </Button>
                )}
        </Box>
    )
}
