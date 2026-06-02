import { Controller, useFormContext } from 'react-hook-form'

import { Box, ListItem, NumberField, SelectField } from '@gorgias/axiom'

const PRESET_DAYS = [0, 7, 14, 30]
const CUSTOM_ID = 'custom'

type DayOption = { id: string; label: string }

const PRESET_OPTIONS: DayOption[] = [
    ...PRESET_DAYS.map((d) => ({ id: String(d), label: `${d} days` })),
    { id: CUSTOM_ID, label: 'Custom' },
]

const isPreset = (value: number | undefined): boolean =>
    value != null && PRESET_DAYS.includes(value)

export const TimingOffset = () => {
    const { control } = useFormContext()

    return (
        <Controller
            name="timing_offset"
            control={control}
            render={({ field }) => {
                const value = (field.value as number | undefined) ?? 0
                const isCustom = !isPreset(value)
                const selectedId = isCustom ? CUSTOM_ID : String(value)
                const selectedOption =
                    PRESET_OPTIONS.find((o) => o.id === selectedId) ??
                    PRESET_OPTIONS[0]

                return (
                    <Box flexDirection="column" gap="sm" width="100%">
                        <SelectField
                            label="Trigger delay"
                            items={PRESET_OPTIONS}
                            value={selectedOption}
                            onChange={(option) => {
                                if (option.id === CUSTOM_ID) {
                                    if (!isCustom) {
                                        field.onChange(1)
                                    }
                                } else {
                                    field.onChange(Number(option.id))
                                }
                            }}
                        >
                            {(option) => <ListItem label={option.label} />}
                        </SelectField>
                        {isCustom && (
                            <NumberField
                                label="Custom delay (days)"
                                value={value}
                                onChange={(v) => field.onChange(v ?? 0)}
                                minValue={0}
                                formatOptions={{
                                    style: 'decimal',
                                    useGrouping: false,
                                }}
                            />
                        )}
                    </Box>
                )
            }}
        />
    )
}
