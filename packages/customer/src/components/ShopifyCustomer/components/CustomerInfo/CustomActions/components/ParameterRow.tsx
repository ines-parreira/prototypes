import { useFormContext, useWatch } from '@repo/forms'

import {
    Box,
    Button,
    ListItem,
    SelectField,
    TextAreaField,
    TextField,
    ToggleField,
} from '@gorgias/axiom'

import { PARAMETER_TYPES } from '../utils/customActionConstants'
import type { Parameter, ParameterType } from '../utils/customActionTypes'
import {
    applyParameterConstraints,
    validateDropdownValues,
} from '../utils/customActionUtils'

import css from './ParameterList.less'

type SelectItem = { id: string; name: string }

type Props = {
    name: string
    onRemove: () => void
}

export function ParameterRow({ name, onRemove }: Props) {
    const { setValue, getValues } = useFormContext()
    const param = useWatch({ name }) as Parameter

    const paramType = param.type ?? 'text'
    const isDropdown = paramType === 'dropdown'
    const isEditable = isDropdown || (param.editable ?? false)
    const selectedType =
        PARAMETER_TYPES.find((t) => t.id === paramType) ?? PARAMETER_TYPES[0]
    const dropdownError = isDropdown
        ? validateDropdownValues(param.value)
        : undefined

    function handleChange(updates: Partial<Parameter>) {
        const current = getValues(name) as Parameter
        const updated = applyParameterConstraints({ ...current, ...updates })
        setValue(name, updated)
    }

    return (
        <Box flexDirection="column" gap="xs">
            <Box flexDirection="row" gap="xs" alignItems="center">
                <div className={css.typeColumn}>
                    <SelectField
                        items={PARAMETER_TYPES}
                        value={selectedType}
                        onChange={(item: SelectItem) =>
                            handleChange({ type: item.id as ParameterType })
                        }
                        aria-label="Type"
                        size="sm"
                    >
                        {(item: SelectItem) => (
                            <ListItem id={item.id} label={item.name} />
                        )}
                    </SelectField>
                </div>
                <Box flex={1}>
                    <TextField
                        value={param.label ?? ''}
                        onChange={(val) => handleChange({ label: val })}
                        placeholder="Display name"
                        size="sm"
                        aria-label="Label"
                    />
                </Box>
                <Box flex={1}>
                    <TextField
                        value={param.key}
                        onChange={(val) => handleChange({ key: val })}
                        size="sm"
                        aria-label="Key"
                    />
                </Box>
                {isDropdown ? (
                    <Box flex={1} />
                ) : (
                    <Box flex={1}>
                        <TextField
                            value={param.value}
                            onChange={(val) => handleChange({ value: val })}
                            size="sm"
                            aria-label="Value"
                        />
                    </Box>
                )}
                <div className={css.toggleColumn}>
                    <ToggleField
                        aria-label="Editable"
                        label=""
                        value={isEditable}
                        onChange={(val) => handleChange({ editable: val })}
                        isDisabled={isDropdown}
                    />
                </div>
                <div className={css.toggleColumn}>
                    <ToggleField
                        aria-label="Required"
                        label=""
                        value={param.mandatory ?? false}
                        onChange={(val) => handleChange({ mandatory: val })}
                        isDisabled={!isEditable}
                    />
                </div>
                <Button
                    size="sm"
                    variant="tertiary"
                    intent="destructive"
                    onClick={onRemove}
                >
                    Remove
                </Button>
            </Box>

            {isDropdown && (
                <TextAreaField
                    label="Values"
                    value={param.value}
                    onChange={(val) => handleChange({ value: val })}
                    placeholder="e.g. Value 1; Value 2; Value 3"
                    caption="Max 10 values separated by semicolons"
                    error={dropdownError}
                    isInvalid={!!dropdownError}
                    rows={2}
                />
            )}
        </Box>
    )
}
