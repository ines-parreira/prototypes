import { Controller, useFormContext } from 'react-hook-form'

import { Box, ListItem, NumberField, SelectField } from '@gorgias/axiom'

const MINUTES_PER_HOUR = 60
const PRESET_HOURS = [0, 12, 24, 48]
const CUSTOM_ID = 'custom'

type HourOption = { id: string; label: string }

const PRESET_OPTIONS: HourOption[] = [
    ...PRESET_HOURS.map((h) => ({ id: String(h), label: `${h} hours` })),
    { id: CUSTOM_ID, label: 'Custom' },
]

const isPreset = (hours: number): boolean => PRESET_HOURS.includes(hours)

export const TimingOffset = () => {
    const { control } = useFormContext()

    return (
        <Controller
            name="timing_offset"
            control={control}
            render={({ field }) => {
                const minutes = (field.value as number | undefined) ?? 0
                const hours = minutes / MINUTES_PER_HOUR
                const isCustom = !isPreset(hours)
                const selectedId = isCustom ? CUSTOM_ID : String(hours)
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
                                        field.onChange(MINUTES_PER_HOUR)
                                    }
                                } else {
                                    field.onChange(
                                        Number(option.id) * MINUTES_PER_HOUR,
                                    )
                                }
                            }}
                        >
                            {(option) => <ListItem label={option.label} />}
                        </SelectField>
                        {isCustom && (
                            <NumberField
                                label="Custom delay (hours)"
                                value={hours}
                                onChange={(v) =>
                                    field.onChange((v ?? 0) * MINUTES_PER_HOUR)
                                }
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
