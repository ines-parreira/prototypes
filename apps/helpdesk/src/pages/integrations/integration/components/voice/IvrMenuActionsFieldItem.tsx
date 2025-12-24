import { FormField, useWatch } from '@repo/forms'

import {
    Box,
    LegacyButton as Button,
    LegacyIconButton as IconButton,
} from '@gorgias/axiom'
import type { BranchOptions } from '@gorgias/helpdesk-types'

import InputField from 'pages/common/forms/input/InputField'

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
    const value: BranchOptions | null = useWatch({ name: fieldName })

    return (
        <Box gap="xs" width="100%">
            <Button intent="secondary">{value?.input_digit}</Button>
            <FormField
                field={InputField}
                key={fieldName}
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
