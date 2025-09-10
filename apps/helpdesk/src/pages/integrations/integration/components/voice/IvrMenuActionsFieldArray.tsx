import { Box, Button } from '@gorgias/axiom'
import { BranchOptions } from '@gorgias/helpdesk-types'

import { useFieldArray, useWatch } from 'core/forms'

import { IvrMenuActionFieldItem } from './IvrMenuActionsFieldItem'

type Props = {
    name: string
    onAddOption?: (option: BranchOptions, insertAtIndex: number) => void
    onRemoveOption?: (optionIndex: number) => void
    branchNextId: string | null
}

export function IvrMenuActionsFieldArray({
    name,
    onAddOption,
    onRemoveOption,
    branchNextId,
}: Props): JSX.Element {
    const { fields, insert, remove } = useFieldArray({
        name,
    })
    const fieldValue = useWatch({ name })

    const handleAddOption = () => {
        const nextAvailableDigit = getNextAvailableDigit(fieldValue)

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
            {fields.length < 9 && (
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
): string | null => {
    const digits = branchOptions.map((option) => option.input_digit)
    for (let i = 1; i <= 9; i++) {
        if (!digits.includes(i.toString())) {
            return i.toString()
        }
    }
    return null
}
