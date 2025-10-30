import { Box, Button, Icon } from '@gorgias/axiom'
import { CustomerFieldBranchOption, CustomField } from '@gorgias/helpdesk-types'

import { useFieldArray } from 'core/forms'

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

    const handleAddOption = () => {
        const newOption: CustomerFieldBranchOption = {
            field_value: '',
            branch_name: '',
            next_step_id: branchNextId!,
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
                fields.length < inputSettings.choices.length && (
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
