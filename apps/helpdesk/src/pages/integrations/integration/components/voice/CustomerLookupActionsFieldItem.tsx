import { FormField, useWatch } from '@repo/forms'

import {
    Box,
    LegacyIconButton as IconButton,
    ListItem,
    MultiSelectField,
    MultiSelectItem,
    SelectField,
    TextField,
} from '@gorgias/axiom'
import type { CustomerFieldBranchOption } from '@gorgias/helpdesk-types'

const DROPDOWN_WIDTH = '160px'

type CustomerLookupActionsFieldItemProps = {
    stepName: string
    onRemove?: () => void
    isRemovable?: boolean
    branchNameFieldName?: string
    fieldValueName?: string
    fieldValueOptions?: string[] | boolean[]
}

type Option = {
    id: string
    name: string
}

enum BooleanFieldValue {
    True = 'True',
    False = 'False',
}

export function CustomerLookupActionsFieldItem({
    stepName,
    onRemove,
    isRemovable,
    branchNameFieldName,
    fieldValueName,
    fieldValueOptions = [],
}: CustomerLookupActionsFieldItemProps): JSX.Element {
    const branchOptions: CustomerFieldBranchOption[] = useWatch({
        name: `${stepName}.branch_options`,
        defaultValue: [],
    })

    const stringFieldValueOptions: string[] = fieldValueOptions.map(
        (option) => {
            if (typeof option === 'string') {
                return option
            }

            return option ? BooleanFieldValue.True : BooleanFieldValue.False
        },
    )

    const availableOptions = stringFieldValueOptions.filter(
        (option) =>
            !branchOptions.some((branchOption) =>
                typeof branchOption.field_value === 'string'
                    ? branchOption.field_value === option
                    : branchOption.field_value.includes(option),
            ),
    )

    return (
        <Box gap="xs" alignItems="flex-end" width="100%">
            {fieldValueName && branchNameFieldName ? (
                <>
                    <Box w={DROPDOWN_WIDTH} flexShrink={0}>
                        <FormField
                            field={MultiSelectField<Option>}
                            placeholder="Select value"
                            name={fieldValueName}
                            items={stringFieldValueOptions.map((option) =>
                                transformFieldValueOption(
                                    option,
                                    fieldValueOptions,
                                ),
                            )}
                            outputTransform={(options: Option[]) =>
                                options.map((option) => option.id)
                            }
                            inputTransform={(value: string | string[]) => {
                                const arrValue =
                                    typeof value === 'string' ? [value] : value

                                return arrValue.map((option) =>
                                    transformFieldValueOption(
                                        option,
                                        fieldValueOptions,
                                    ),
                                )
                            }}
                        >
                            {(option: { id: string; name: string }) => (
                                <MultiSelectItem
                                    label={option.name}
                                    isDisabled={
                                        !availableOptions.includes(option.id)
                                    }
                                />
                            )}
                        </FormField>
                    </Box>
                    <FormField
                        field={TextField}
                        name={branchNameFieldName}
                        placeholder="Branch name"
                    />
                </>
            ) : (
                <>
                    <Box w={DROPDOWN_WIDTH} flexShrink={0}>
                        <SelectField
                            value={otherOption}
                            items={[otherOption]}
                            isDisabled
                        >
                            {(option: { id: string; name: string }) => (
                                <ListItem label={option.name} />
                            )}
                        </SelectField>
                    </Box>
                    <TextField placeholder="Branch name" isDisabled />
                </>
            )}

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

const transformFieldValueOption = (
    option: string,
    fieldValueOptions: string[] | boolean[],
): Option => {
    if (typeof fieldValueOptions[0] === 'boolean') {
        return {
            id: option,
            name: option === BooleanFieldValue.True ? 'Yes' : 'No',
        }
    }

    return { id: option, name: option }
}
