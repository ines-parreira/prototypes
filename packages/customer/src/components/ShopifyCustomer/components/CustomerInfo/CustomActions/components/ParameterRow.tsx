import {
    Box,
    Button,
    TextAreaField,
    TextField,
    ToggleField,
} from '@gorgias/axiom'

import { PARAMETER_TYPES } from '../utils/customActionConstants'
import type { Parameter, ParameterType } from '../utils/customActionTypes'
import { validateDropdownValues } from '../utils/customActionUtils'
import { SelectDropdown } from './SelectDropdown'

import css from './ParameterList.less'

type Props = {
    param: Parameter
    index: number
    onChange: (index: number, field: keyof Parameter, val: unknown) => void
    onRemove: (index: number) => void
}

export function ParameterRow({ param, index, onChange, onRemove }: Props) {
    const paramType = param.type ?? 'text'
    const isDropdown = paramType === 'dropdown'
    const isEditable = isDropdown || (param.editable ?? false)
    const selectedType =
        PARAMETER_TYPES.find((t) => t.id === paramType) ?? PARAMETER_TYPES[0]
    const dropdownError = isDropdown
        ? validateDropdownValues(param.value)
        : undefined

    return (
        <Box flexDirection="column" gap="xs">
            <Box flexDirection="row" gap="xs" alignItems="center">
                <div className={css.typeColumn}>
                    <SelectDropdown
                        items={PARAMETER_TYPES}
                        selectedItem={selectedType}
                        onSelect={(item) =>
                            onChange(index, 'type', item.id as ParameterType)
                        }
                        aria-label="Type"
                        size="sm"
                    />
                </div>
                <Box flex={1}>
                    <TextField
                        value={param.label ?? ''}
                        onChange={(val) => onChange(index, 'label', val)}
                        placeholder="Display name"
                        size="sm"
                        aria-label="Label"
                    />
                </Box>
                <Box flex={1}>
                    <TextField
                        value={param.key}
                        onChange={(val) => onChange(index, 'key', val)}
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
                            onChange={(val) => onChange(index, 'value', val)}
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
                        onChange={(val) => onChange(index, 'editable', val)}
                        isDisabled={isDropdown}
                    />
                </div>
                <div className={css.toggleColumn}>
                    <ToggleField
                        aria-label="Required"
                        label=""
                        value={param.mandatory ?? false}
                        onChange={(val) => onChange(index, 'mandatory', val)}
                        isDisabled={!isEditable}
                    />
                </div>
                <Button
                    size="sm"
                    variant="tertiary"
                    intent="destructive"
                    onClick={() => onRemove(index)}
                >
                    Remove
                </Button>
            </Box>

            {isDropdown && (
                <TextAreaField
                    label="Values"
                    value={param.value}
                    onChange={(val) => onChange(index, 'value', val)}
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
