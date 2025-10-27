import {
    Box,
    LegacyIconButton as IconButton,
    ListItem,
    SelectField,
} from '@gorgias/axiom'
import { CustomerFieldBranchOption } from '@gorgias/helpdesk-types'

import { FormField, useWatch } from 'core/forms'
import InputField from 'pages/common/forms/input/InputField'

import css from './IvrMenuActionsFieldItem.less'

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
            !branchOptions.some(
                (branchOption) => branchOption.field_value === option,
            ),
    )

    return (
        <Box gap="xs" alignItems="flex-end" width="100%">
            {fieldValueName && branchNameFieldName ? (
                <>
                    <FormField
                        field={SelectField<Option>}
                        placeholder="Select value"
                        name={fieldValueName}
                        items={stringFieldValueOptions.map((option) =>
                            transformFieldValueOption(
                                option,
                                fieldValueOptions,
                            ),
                        )}
                        outputTransform={(option) => option.id}
                        inputTransform={(option: string) =>
                            transformFieldValueOption(option, fieldValueOptions)
                        }
                    >
                        {(option: { id: string; name: string }) => (
                            <ListItem
                                label={option.name}
                                isDisabled={
                                    !availableOptions.includes(option.id)
                                }
                            />
                        )}
                    </FormField>
                    <FormField
                        name={branchNameFieldName}
                        className={css.branchName}
                        placeholder="Branch name"
                    />
                </>
            ) : (
                <>
                    <SelectField
                        value={otherOption}
                        items={[otherOption]}
                        isDisabled
                    >
                        {(option: { id: string; name: string }) => (
                            <ListItem label={option.name} />
                        )}
                    </SelectField>
                    <InputField
                        placeholder="Branch name"
                        className={css.branchName}
                        isDisabled
                    />
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
