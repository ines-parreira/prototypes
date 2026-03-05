import { useFieldArray } from '@repo/forms'

import { Box, Button, Text } from '@gorgias/axiom'

import type { Parameter } from '../utils/customActionTypes'
import { ParameterRow } from './ParameterRow'

import css from './ParameterList.less'

type Props = {
    name: string
    label: string
}

const EMPTY_PARAMETER: Omit<Parameter, 'id'> = {
    key: '',
    value: '',
    type: 'text',
    label: '',
    editable: false,
    mandatory: false,
}

export function ParameterList({ name, label: listLabel }: Props) {
    const { fields, append, remove } = useFieldArray({ name })

    function handleAdd() {
        append({ ...EMPTY_PARAMETER, id: crypto.randomUUID() })
    }

    return (
        <Box flexDirection="column" gap="xs">
            <Text size="sm" variant="bold">
                {listLabel}
            </Text>
            {fields.length > 0 && (
                <Box flexDirection="row" gap="xs" alignItems="flex-end">
                    <div className={css.typeColumn}>
                        <Text size="xs" variant="bold">
                            Type
                        </Text>
                    </div>
                    <Box flex={1}>
                        <Text size="xs" variant="bold">
                            Label
                        </Text>
                    </Box>
                    <Box flex={1}>
                        <Text size="xs" variant="bold">
                            Key
                        </Text>
                    </Box>
                    <Box flex={1}>
                        <Text size="xs" variant="bold">
                            Value
                        </Text>
                    </Box>
                    <div className={css.toggleHeaderColumn}>
                        <Text size="xs" variant="bold">
                            Editable
                        </Text>
                    </div>
                    <div className={css.toggleHeaderColumn}>
                        <Text size="xs" variant="bold">
                            Required
                        </Text>
                    </div>
                    <div className={css.removeColumn} />
                </Box>
            )}
            {fields.map((field, index) => (
                <ParameterRow
                    key={field.id}
                    name={`${name}.${index}`}
                    onRemove={() => remove(index)}
                />
            ))}
            <Box>
                <Button
                    size="sm"
                    variant="tertiary"
                    leadingSlot="add-plus"
                    onClick={handleAdd}
                >
                    Add parameter
                </Button>
            </Box>
        </Box>
    )
}
