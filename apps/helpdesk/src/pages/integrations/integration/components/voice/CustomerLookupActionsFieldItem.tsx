import {
    Box,
    LegacyIconButton as IconButton,
    ListItem,
    SelectField,
} from '@gorgias/axiom'

import { FormField } from 'core/forms'

import css from './IvrMenuActionsFieldItem.less'

type CustomerLookupActionsFieldItemProps = {
    name: string
    onRemove?: () => void
    isRemovable?: boolean
    branchNameFieldName: string
    fieldValueName?: string
}

export function CustomerLookupActionsFieldItem({
    name,
    onRemove,
    isRemovable,
    branchNameFieldName,
    fieldValueName,
}: CustomerLookupActionsFieldItemProps): JSX.Element {
    return (
        <Box gap="xs" alignItems="flex-end" width="100%">
            {fieldValueName ? (
                <FormField
                    field={SelectField<{ id: string; name: string }>}
                    name={fieldValueName}
                    items={[]}
                >
                    {(option: { id: string; name: string }) => (
                        <ListItem label={option.name} />
                    )}
                </FormField>
            ) : (
                <SelectField
                    value={otherOption}
                    items={[otherOption]}
                    isDisabled
                >
                    {(option: { id: string; name: string }) => (
                        <ListItem label={option.name} />
                    )}
                </SelectField>
            )}

            <FormField
                key={name}
                className={css.branchName}
                name={branchNameFieldName}
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

const otherOption: { id: string; name: string } = {
    id: 'Other',
    name: 'Other',
}
