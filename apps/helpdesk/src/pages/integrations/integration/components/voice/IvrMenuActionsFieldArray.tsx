import { useFieldArray, useWatch } from '@repo/forms'

import { Box, Button, Icon } from '@gorgias/axiom'
import type { BranchOptions } from '@gorgias/helpdesk-types'

import { useDeleteNode } from './flows/utils/useDeleteNode'
import { IvrMenuActionFieldItem } from './IvrMenuActionsFieldItem'

type Props = {
    name: string
    onAddOption?: () => void
    branchNextId: string | null
    maxOptions?: number
}

export function IvrMenuActionsFieldArray({
    name,
    onAddOption,
    branchNextId,
    maxOptions = 9,
}: Props): JSX.Element {
    const { fields, insert, remove } = useFieldArray({
        name,
    })
    const fieldValue = useWatch({ name })
    const { removeUnlinkedSteps } = useDeleteNode()

    const handleAddOption = () => {
        const nextAvailableDigit = getNextAvailableDigit(fieldValue, maxOptions)

        if (nextAvailableDigit) {
            const insertAtIndex = Number(nextAvailableDigit) - 1
            const newOption: BranchOptions = {
                branch_name: '',
                input_digit: nextAvailableDigit,
                next_step_id: branchNextId!,
            }
            insert(insertAtIndex, newOption)
            onAddOption?.()
        }
    }

    const handleRemoveOption = (index: number) => {
        remove(index)
        removeUnlinkedSteps()
    }

    return (
        <Box gap="md" flexDirection="column" alignItems="flex-start">
            {fields.map((field, index) => {
                return (
                    <IvrMenuActionFieldItem
                        key={field.id}
                        index={index}
                        name={name}
                        onRemove={() => handleRemoveOption(index)}
                        isRemovable={fields.length > 2}
                    />
                )
            })}
            {fields.length < maxOptions && (
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

const getNextAvailableDigit = (
    branchOptions: BranchOptions[],
    maxOptions: number,
): string | null => {
    const digits = branchOptions.map((option) => option.input_digit)
    for (let i = 1; i <= maxOptions; i++) {
        if (!digits.includes(i.toString())) {
            return i.toString()
        }
    }
    return null
}
