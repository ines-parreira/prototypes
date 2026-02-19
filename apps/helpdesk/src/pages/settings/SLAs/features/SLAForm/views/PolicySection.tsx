import { FormField, useFormContext } from '@repo/forms'

import { Box, Heading, Text, ToggleField } from '@gorgias/axiom'

import { VoicePolicyFields } from 'pages/settings/SLAs/features/SLAForm/views/VoicePolicyFields'

import type { SLAFormValues } from '../controllers/useFormValues'
import { MetricsFieldArray } from './MetricsFieldArray'

import css from './PolicySection.less'

export function PolicySection() {
    const { watch } = useFormContext<SLAFormValues>()

    const selectedChannels = watch('target_channels')
    const isVoiceChannelSelected = selectedChannels.includes('phone')

    if (selectedChannels.length === 0) {
        return null
    }

    return (
        <>
            <div>
                <Heading size="lg">Policy</Heading>
                <Text className={css.sectionDescription}>
                    {isVoiceChannelSelected
                        ? 'Set the percentage of calls that must be answered within the time threshold. The SLA calculation starts when the call enters the queue and excludes time spent in the IVR menu and the greeting message.'
                        : 'Define the first response time and / or resolution times to be set as goals by your team(s).'}
                </Text>
            </div>

            <Box flexDirection="column" gap="sm">
                {isVoiceChannelSelected ? (
                    <VoicePolicyFields />
                ) : (
                    <MetricsFieldArray />
                )}
            </Box>
            <Box flexDirection="column" gap="sm">
                {!isVoiceChannelSelected && (
                    <FormField
                        name="business_hours_only"
                        field={ToggleField}
                        label="Pause SLA timer outside of business hours"
                    />
                )}
                <FormField
                    name="active"
                    field={ToggleField}
                    label="Enable SLA"
                    caption={
                        'When enabled new tickets that fit this criteria will trigger this SLA.'
                    }
                />
            </Box>
        </>
    )
}
