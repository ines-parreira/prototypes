import { Box, Button, IconButton } from '@gorgias/axiom'

import { FormField, useWatch } from 'core/forms'

import css from './IvrMenuActionsFieldItem.less'

type IvrMenuActionFieldProps = {
    name: string
    onRemove: () => void
    index: number
    isRemovable: boolean
}

export function IvrMenuActionFieldItem({
    name,
    onRemove,
    index,
    isRemovable,
}: IvrMenuActionFieldProps): JSX.Element {
    const fieldName = `${name}.${index}`
    const value = useWatch({ name: fieldName })

    return (
        <Box gap="var(--layout-spacing-xs)" width="100%">
            <Button intent="secondary">{value.input_digit}</Button>
            <FormField
                className={css.branchName}
                name={`${name}.${index}.branch_name`}
                placeholder="Branch name"
            />
            {isRemovable && (
                <IconButton
                    icon="close"
                    intent="destructive"
                    fillStyle="ghost"
                    onClick={onRemove}
                />
            )}
        </Box>
    )
}
