import { FormField } from '@repo/forms'

import { Box, NumberField, TextField } from '@gorgias/axiom'

import TimeUnitSelectField from 'pages/settings/SLAs/features/SLAForm/views/TimeUnitSelectField'

const METRICS_FIELD_NAME = 'metrics.0'

export function VoicePolicyFields() {
    return (
        <Box gap="sm" alignItems="flex-end">
            <FormField
                field={NumberField}
                name={`target`}
                minValue={0}
                maxValue={100}
                isRequired
                label="Target (%)"
                trailingSlot="percent"
                inputTransform={(value) =>
                    value === undefined ? value : value * 100
                }
                outputTransform={(value) =>
                    value === undefined ? value : value / 100
                }
            />
            <FormField
                field={TextField}
                name={`${METRICS_FIELD_NAME}.threshold`}
                isRequired
                label="Threshold"
                inputTransform={(value) =>
                    value?.toString().replace(/[^0-9]/g, '')
                }
            />
            <Box flexShrink="0">
                <TimeUnitSelectField name={`${METRICS_FIELD_NAME}.unit`} />
            </Box>
        </Box>
    )
}
