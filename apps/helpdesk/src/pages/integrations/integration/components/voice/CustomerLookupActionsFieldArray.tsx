import { Box, Button, Icon } from '@gorgias/axiom'
import { CustomerFieldBranchOption } from '@gorgias/helpdesk-types'

import { useFieldArray } from 'core/forms'

import { CustomerLookupActionsFieldItem } from './CustomerLookupActionsFieldItem'

type Props = {
    stepName: string
    onAddOption?: () => void
    onRemoveOption?: (optionIndex: number) => void
    branchNextId: string | null
}

export function CustomerLookupActionsFieldArray({
    stepName,
    onAddOption,
    onRemoveOption,
    branchNextId,
}: Props): JSX.Element {
    const { fields, append, remove } = useFieldArray({
        name: `${stepName}.branch_options`,
    })

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
        onRemoveOption?.(index)
    }

    return (
        <Box flexDirection="column" alignItems="flex-start" gap="sm">
            <CustomerLookupActionsFieldItem
                name={`${stepName}.default_branch_name`}
                branchNameFieldName={`${stepName}.default_branch_name`}
            />
            {fields.map((field, index) => {
                const itemName = `${stepName}.branch_options.${index}`

                return (
                    <CustomerLookupActionsFieldItem
                        key={field.id}
                        name={itemName}
                        branchNameFieldName={`${itemName}.branch_name`}
                        fieldValueName={`${itemName}.field_value`}
                        onRemove={() => handleRemoveOption(index)}
                        isRemovable
                    />
                )
            })}
            <Button
                variant="secondary"
                onClick={handleAddOption}
                leadingSlot={<Icon name="add-plus" />}
            >
                Add option
            </Button>
        </Box>
    )
}
