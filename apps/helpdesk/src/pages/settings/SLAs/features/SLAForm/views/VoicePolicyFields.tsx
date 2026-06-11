import { FormField } from '@repo/forms'

import { Box, NumberField } from '@gorgias/axiom'

import TimeUnitSelectField from 'pages/settings/SLAs/features/SLAForm/views/TimeUnitSelectField'

const METRICS_FIELD_NAME = 'metrics.0'

export function VoicePolicyFields() {
    return (
        <Box gap="sm" alignItems="flex-end">
            <FormField name={`target`} isRequired label="Target">
                {(field) => (
                    <NumberField
                        {...field}
                        minValue={0}
                        maxValue={100}
                        trailingSlot="percent"
                        value={
                            field.value === undefined
                                ? field.value
                                : field.value * 100
                        }
                        onChange={(value) =>
                            field.onChange(
                                value === undefined ? value : value / 100,
                            )
                        }
                    />
                )}
            </FormField>
            <FormField
                name={`${METRICS_FIELD_NAME}.threshold`}
                isRequired
                label="Threshold"
            >
                {(field) => <NumberField {...field} trailingSlot={''} />}
            </FormField>
            <Box flexShrink="0">
                <TimeUnitSelectField name={`${METRICS_FIELD_NAME}.unit`} />
            </Box>
        </Box>
    )
}
