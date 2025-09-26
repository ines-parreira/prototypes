import { Box, Button } from '@gorgias/axiom'
import { BranchOptions } from '@gorgias/helpdesk-types'

import { useFieldArray, useWatch } from 'core/forms'

import { IvrMenuActionFieldItem } from './IvrMenuActionsFieldItem'

type Props = {
    name: string
    onAddOption?: (option: BranchOptions, insertAtIndex: number) => void
    onRemoveOption?: (optionIndex: number) => void
    branchNextId: string | null
    maxOptions?: number
}

export function IvrMenuActionsFieldArray({
    name,
    onAddOption,
    onRemoveOption,
    branchNextId,
    maxOptions = 9,
}: Props): JSX.Element {
    const { fields, insert, remove } = useFieldArray({
        name,
    })
    const fieldValue = useWatch({ name })

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
            onAddOption?.(newOption, insertAtIndex)
        }
    }

    const handleRemoveOption = (index: number) => {
        remove(index)
        onRemoveOption?.(index)
    }

    return (
        <Box
            gap="var(--layout-spacing-s)"
            flexDirection="column"
            alignItems="flex-start"
        >
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
                    intent="secondary"
                    onClick={handleAddOption}
                    leadingIcon="add"
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
