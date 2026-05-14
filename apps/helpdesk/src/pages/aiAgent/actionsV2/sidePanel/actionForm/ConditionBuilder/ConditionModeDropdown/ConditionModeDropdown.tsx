import { Button, ListItem, Select } from '@gorgias/axiom'

import type { LogicOperator } from '../types'

type Mode = { id: LogicOperator; label: string }

const MODES: Mode[] = [
    { id: 'none', label: 'No conditions required' },
    { id: 'all', label: 'All conditions are met' },
    { id: 'any', label: 'Any condition is met' },
]

type Props = {
    value: LogicOperator
    onChange: (next: LogicOperator) => void
    label?: string
}

export const ConditionModeDropdown = ({
    value,
    onChange,
    label = 'Conditions mode',
}: Props) => {
    const selected = MODES.find((mode) => mode.id === value) ?? MODES[0]
    return (
        <Select
            items={MODES}
            selectedItem={selected}
            onSelect={(mode: Mode) => onChange(mode.id)}
            aria-label={label}
            trigger={({ selectedText, isOpen }) => (
                <Button
                    variant="secondary"
                    size="sm"
                    trailingSlot={
                        isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                    }
                >
                    {selectedText || selected.label}
                </Button>
            )}
        >
            {(mode: Mode) => (
                <ListItem key={mode.id} id={mode.id} label={mode.label} />
            )}
        </Select>
    )
}
