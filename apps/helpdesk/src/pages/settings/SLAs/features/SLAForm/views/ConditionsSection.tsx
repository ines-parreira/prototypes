import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useFormContext } from '@repo/forms'

import { Box, Tag } from '@gorgias/axiom'

import type { SLAFormValues } from '../controllers/useFormValues'
import { ConditionsDisclaimer } from './ConditionsDisclaimer'
import { ConditionsSelectBox } from './ConditionsSelect'

export function ConditionsSection() {
    const { watch } = useFormContext<SLAFormValues>()

    const selectedChannels = watch('target_channels')
    const conditions = watch('conditions')

    const isFilterByTagsAndFieldsEnabled = useFlag(
        FeatureFlagKey.TicketSLAFilterByTagsTicketFields,
        false,
    )
    if (selectedChannels.length === 0 || !isFilterByTagsAndFieldsEnabled) {
        return null
    }

    return (
        <>
            <Box alignItems="flex-start">
                <Tag color="purple" size="sm">
                    AND
                </Tag>
            </Box>

            <ConditionsSelectBox maxSelections={5} />
            <Box marginTop="md" flexDirection="column">
                <ConditionsDisclaimer conditions={conditions} />
            </Box>
        </>
    )
}
