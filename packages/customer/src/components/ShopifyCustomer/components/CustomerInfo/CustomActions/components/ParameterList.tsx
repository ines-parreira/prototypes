import { useCallback } from 'react'

import { Box, Button, Text } from '@gorgias/axiom'

import type { Parameter } from '../utils/customActionTypes'
import { ParameterRow } from './ParameterRow'

import css from './ParameterList.less'

type Props = {
    label: string
    parameters: Parameter[]
    onChange: (params: Parameter[]) => void
}

export function ParameterList({
    label: listLabel,
    parameters,
    onChange,
}: Props) {
    const handleAdd = useCallback(() => {
        onChange([
            ...parameters,
            {
                key: '',
                value: '',
                type: 'text',
                label: '',
                editable: false,
                mandatory: false,
            },
        ])
    }, [parameters, onChange])

    const handleRemove = useCallback(
        (index: number) => {
            onChange(parameters.filter((_, i) => i !== index))
        },
        [parameters, onChange],
    )

    const handleChange = useCallback(
        (index: number, field: keyof Parameter, val: unknown) => {
            const updated = parameters.map((p, i) => {
                if (i !== index) return p

                const next = { ...p, [field]: val }

                if (field === 'type' && val === 'dropdown') {
                    next.editable = true
                }

                if (field === 'editable' && !val) {
                    next.mandatory = false
                }

                return next
            })
            onChange(updated)
        },
        [parameters, onChange],
    )

    return (
        <Box flexDirection="column" gap="xs">
            <Text size="sm" variant="bold">
                {listLabel}
            </Text>
            {parameters.length > 0 && (
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
            {parameters.map((param, index) => (
                <ParameterRow
                    key={index}
                    param={param}
                    index={index}
                    onChange={handleChange}
                    onRemove={handleRemove}
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
